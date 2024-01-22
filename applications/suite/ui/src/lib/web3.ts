import Web3 from "web3";
import {BigNumber as BN} from "bignumber.js";
import {erc20Abi, tokenV1Abi, swapEngineAbi} from "../abis";
import {REQUIRED_CONFIRMATIONS, V1_TOTAL_SUPPLY} from "../constants";

const {toBN, fromWei} = Web3.utils;

// V1: 0x50c9223E04f36a547b2d44121085647b736Ee00a
// V2: 0x755665f26B5cEd25Ec3D92AA3c99C3aC25668Fa3

// Bingo: 0xbA6e6237d40BA6D401D775198222D580BF62791b
// Bongo: 0x79591b82E4A88255fbC4ecb7255E2EC24bBc4b3c

export const getV1ContractAddress = (networkId: number) =>
  networkId === 1 ? "0x2467AA6B5A2351416fD4C3DeF8462d841feeecEC" : "0xbc4b7166D0Cdf00B9eeFED6bfF1211692169411D";
export const getV2ContractAddress = (networkId: number) =>
  networkId === 1 ? "0x26E1f9F817b3b5FC2146c01ae34826593E593962" : "0x4a91179868EA1E3b4d1194243F4a57aAD2f1b789";
const getEngineContractAddress = (networkId: number) =>
  networkId === 1 ? "0x866310b0b81ce30b0f0c817c3c7fabdfc39a3518" : "0x82f0693e77fDA2525bD18Bb2D3122fA6ea803b01";
// const confirmationBlockNumber = (networkId: number) => (networkId === 1 ? NUMBER_OF_CONFIRMATIONS_ETH[0] : NUMBER_OF_CONFIRMATIONS_ETH[1]);

const convertToHex = (web3: Web3, value: string): string => {
  return web3.utils.toHex(value);
};

export const getNetworkId = async (web3: Web3): Promise<number> => web3.eth.net.getId();

export const approveTokenTransfer = async (
  web3: Web3,
  amount: number,
  fromAddress: string,
  onError: () => void,
  onTransactionHash: () => void,
  onCompletion?: () => void
) => {
  try {
    const networkId = await getNetworkId(web3);
    // web3.eth.transactionConfirmationBlocks = confirmationBlockNumber(networkId);
    const v1TokenAddress = getV1ContractAddress(networkId);
    const v1TokenContract = new web3.eth.Contract(JSON.parse(erc20Abi), v1TokenAddress);

    const tokenAmount = amount === 0 ? "0" : convertToHex(web3, V1_TOTAL_SUPPLY);
    const engineContractAddress = getEngineContractAddress(networkId);
    const estimatedGasLimit = await v1TokenContract.methods.approve(engineContractAddress, tokenAmount).estimateGas({from: fromAddress});
    const gasPrice = await web3.eth.getGasPrice();

    await v1TokenContract.methods
      .approve(engineContractAddress, tokenAmount)
      .send({from: fromAddress, gas: estimatedGasLimit, gasPrice})
      .on("transactionHash", (_transactionHash: string) => {
        onTransactionHash();
        return;
      })
      .on("error", (error: string) => {
        console.log(`approval error: ${error}`);
        onError();
        return;
      })
      .on("confirmation", (confirmations: number) => {
        console.log(confirmations);
        if (onCompletion && REQUIRED_CONFIRMATIONS === confirmations) {
          onCompletion();
        }
      });
  } catch (error) {
    console.error(error);
    onError();
  }
};

export const swapAllToken = async (web3: Web3, fromAddress: string, onError: () => void, onTransactionHash: () => void, onCompletion: () => void) => {
  try {
    const networkId = await getNetworkId(web3);
    const v1Address = getV1ContractAddress(networkId);
    const v1Contract = new web3.eth.Contract(JSON.parse(tokenV1Abi), v1Address);
    const balance = await v1Contract.methods.balanceOf(fromAddress).call();
    const estimatedGasLimit = await v1Contract.methods.migrate(balance).estimateGas({from: fromAddress});
    const gasPrice = await web3.eth.getGasPrice();

    console.log({balance});

    await v1Contract.methods
      .migrate(balance)
      .send({from: fromAddress, gas: estimatedGasLimit, gasPrice})
      .on("transactionHash", (_transactionHash: string) => {
        onTransactionHash();
      })
      .on("error", (error: string) => {
        console.error(`approval error: ${error}`);
        onError();
        return;
      })
      .on("confirmation", (confirmations: number) => {
        console.log(confirmations);
        if (onCompletion && REQUIRED_CONFIRMATIONS === confirmations) {
          console.log("onCompletion", confirmations);
          onCompletion();
        }
      });

    // const estimatedGasLimit = await v1Contract.methods.migrate(fromAddress).estimateGas({from: fromAddress});

    // const engineAddress = getEngineContractAddress(networkId);
    // const engineContract = new web3.eth.Contract(JSON.parse(swapEngineAbi), engineAddress);
    // const estimatedGasLimit = await engineContract.methods.swapAllToken(fromAddress).estimateGas({from: fromAddress});
    // const gasPrice = await web3.eth.getGasPrice();

    // await engineContract.methods
    //   .swapAllToken(fromAddress)
    //   .send({from: fromAddress, gas: estimatedGasLimit, gasPrice})
    //   .on("transactionHash", (_transactionHash: string) => {
    //     onTransactionHash();
    //   })
    //   .on("error", (error: string) => {
    //     console.error(`approval error: ${error}`);
    //     onError();
    //     return;
    //   })
    //   .on("confirmation", (confirmations: number) => {
    //     console.log(confirmations);
    //     if (onCompletion && REQUIRED_CONFIRMATIONS === confirmations) {
    //       console.log("onCompletion", confirmations);
    //       onCompletion();
    //     }
    //   });
  } catch (error) {
    console.error(error);
    onError();
  }
};

export const getAllowance = async (web3: Web3, fromAddress: string): Promise<string> => {
  const networkId = await getNetworkId(web3);
  const v1TokenAddress = getV1ContractAddress(networkId);
  const tokenContract = new web3.eth.Contract(JSON.parse(erc20Abi), v1TokenAddress);
  const allowance = await tokenContract.methods.allowance(fromAddress, getEngineContractAddress(networkId)).call();
  // return new BN(allowance).div(new BN("100000000")).toString();
  // return (Number(allowance) / Math.pow(10, 8)).toString();
  return (Number(allowance) / Math.pow(10, 18)).toString();
};

export const getBalances = async (web3: Web3, fromAddress: string): Promise<[string, string, string]> => {
  const networkId = await getNetworkId(web3);
  const v1TokenAddress = getV1ContractAddress(networkId);
  const v2TokenAddress = getV2ContractAddress(networkId);
  const v1Contract = new web3.eth.Contract(JSON.parse(erc20Abi), v1TokenAddress);
  const v2Contract = new web3.eth.Contract(JSON.parse(erc20Abi), v2TokenAddress);
  // const engineAddress = getEngineContractAddress(networkId);
  // const engineContract = new web3.eth.Contract(JSON.parse(swapEngineAbi), engineAddress);
  const [v1BalanceInWei, v2BalanceInWei, ethBalanceInWei] = await Promise.all([
    v1Contract.methods.balanceOf(fromAddress).call(),
    v2Contract.methods.balanceOf(fromAddress).call(),
    web3.eth.getBalance(fromAddress)
  ]);
  return [fromWei(v1BalanceInWei).toString(), fromWei(v2BalanceInWei.toString()), web3.utils.fromWei(ethBalanceInWei.toString())];
};
