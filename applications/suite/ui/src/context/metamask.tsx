import React, { useEffect, useState } from "react";
import Web3 from "web3";

declare global {
  interface Window {
    ethereum: any;
    web3: Web3;
  }
}

interface IState {
  awaiting: boolean;
  accounts: string[];
  openMetaMask: () => void;
  web3: Web3 | undefined;
  noMetamask: boolean;
  networkId: string | undefined;
  unsupportedNetwork: boolean | undefined;
}

const initialState: IState = {
  awaiting: true,
  accounts: [],
  openMetaMask: () => { },
  web3: undefined,
  noMetamask: false,
  networkId: undefined,
  unsupportedNetwork: undefined
};

export const MetamaskContext = React.createContext({ ...initialState });

const { Provider } = MetamaskContext;

interface IProps {
  children: React.ReactElement;
  imediate: boolean;
  autoRefreshOnNetworkChange: boolean;
  supportedNetworks: number[];
  transactionConfirmationBlocks: number;
}

const MetamaskProvider = (props: IProps) => {
  const { children, imediate, autoRefreshOnNetworkChange, supportedNetworks, transactionConfirmationBlocks } = props;
  const [web3, setWeb3] = useState(undefined);
  const [awaiting, setAwaiting] = useState(true);
  const [noMetamask, setNoMetamask] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [networkId, setNetworkId] = useState(undefined);
  const [unsupportedNetwork, setUnsupportedNetwork] = useState(undefined);

  const getAccounts = async () => {
    try {
      const newAccounts = await window.web3.eth.getAccounts();
      if (accounts.length === 0 || (accounts.length > 0 && accounts[0] !== newAccounts[0])) {
        setAccounts(newAccounts);
      }
    } catch (error) {
      console.error(error);
    }
    if (awaiting) {
      setAwaiting(false);
    }
  };

  const openMetamask = async () => {
    await window.ethereum.enable();
  };

  const checkAccountChange = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", function (accounts: string[]) {
        setAccounts(accounts);
      });
    } else {
      setInterval(() => {
        getAccounts();
      }, 250);
    }
  };

  const handleNetworkId = (id: number) => {
    if (!supportedNetworks.includes(id)) {
      setUnsupportedNetwork(true);
    } else if (unsupportedNetwork || unsupportedNetwork === undefined) {
      setUnsupportedNetwork(false);
    }
    if (networkId !== id) {
      setNetworkId(id);
    }
  };

  const getNetworkId = async () => {
    try {
      const networkId = await window.web3.eth.net.getId();
      handleNetworkId(networkId);
    } catch (error) {
      console.error("Error getting network ID: ", error);
    }
  };

  const checkNetworkId = () => {
    if (window.ethereum) {
      window.ethereum.on("networkChanged", function (networkId: string) {
        if (autoRefreshOnNetworkChange) {
          location.reload();
        }
        handleNetworkId(Number(networkId));
      });
      if (!networkId) {
        getNetworkId();
      }
    } else {
      setInterval(() => {
        getNetworkId();
      }, 250);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      // Modern dapp browsers
      window.web3 = new Web3(window.ethereum);
      /*
      MetaMask: MetaMask will soon stop reloading pages on network change.
      If you rely upon this behavior, add a 'networkChanged' event handler to trigger the reload manually: https://metamask.github.io/metamask-docs/API_Reference/Ethereum_Provider#ethereum.on(eventname%2C-callback)
      Set 'ethereum.autoRefreshOnNetworkChange' to 'false' to silence this warning: https://metamask.github.io/metamask-docs/API_Reference/Ethereum_Provider#ethereum.autorefreshonnetworkchange'
      */
      window.ethereum.autoRefreshOnNetworkChange = false;

      if (imediate) {
        openMetamask();
      }
      setWeb3(window.web3);
    } else if (window.web3) {
      // Legacy dapp browsers...
      window.web3 = new Web3(window.web3.currentProvider);
      setWeb3(window.web3);
    } else {
      setNoMetamask(true);
      setAwaiting(false);
    }

    if (window.web3) {
      getAccounts();
      checkAccountChange();
      checkNetworkId();
      window.web3.eth.transactionConfirmationBlocks = transactionConfirmationBlocks;
    }
  }, []);

  return <Provider value={{ web3, unsupportedNetwork, noMetamask, accounts, awaiting, openMetaMask: openMetamask, networkId }}>{children}</Provider>;
};

const MetamaskConsumer = MetamaskContext.Consumer;

export { MetamaskProvider, MetamaskConsumer };