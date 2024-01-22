import { Chip, createStyles, Paper, Theme, withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { BigNumber as BN } from "bignumber.js";
import React, { useContext, useEffect, useState } from "react";
import { ControlButton } from "../components/ControlButton";
import CustomPopover from "../components/Popover";
import { TokenInfoCard } from "../components/TokenInfoCard";
import VerticalContainer from "../components/VerticalContainer";
import WarningMessage from "../components/WarningMessage";
import {
  // APPROVE_CONTRACT_STEP_INDEX,
  COMPLETE_PROCESS_STEP,
  REQUIRED_CONFIRMATIONS,
  SEND_TOKENS_STEP_INDEX,
  SUPPORTED_NETWORK_IDS,
  SUPPORTED_NETWORK_NAMES,
  V1_TOKEN_NAME,
  V2_TOKEN_NAME
} from "../constants";
import { MetamaskContext } from "../context/metamask";
import { approveTokenTransfer, getAllowance, getBalances, getNetworkId, getV1ContractAddress, getV2ContractAddress, swapAllToken } from "../lib/web3";
import { Balance, Status } from "../types";
import { formatNumber } from "../utils";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import { Header } from "../components/Header";
import clsx from "clsx";
import { LoadingModal } from "../components/LoadingModal/LoadingModal";

const statusMessages = [
  "We are working on it.",
  "Please be patient.",
  "The block is still not mined.",
  "Miner found the block, waiting for confirmation.",
];

declare global {
  interface Window {
    ethereum: any;
  }
}

interface IProps {
  classes: any;
  setStep: (index: number) => void;
  previousStep: () => void;
}

const UpgradeEngine = (props: IProps) => {
  const { classes } = props;
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [hasHash, setHasHash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balances, setBalance] = useState<Balance>({ v1Balance: "", v2Balance: "", ethBalance: "" });
  const [allowance, setAllowance] = useState<undefined | string>(undefined);
  const [wrongNetwork, setWrongNetwork] = useState(true);
  const [hasCheckedNetwork, setHasCheckedNetwork] = useState(false);
  const [networkId, setnetworkId] = useState<undefined | number>(undefined);
  const { accounts, awaiting, openMetaMask, web3 } = useContext(MetamaskContext);
  const [allowanceStatus, setAllowanceStatus] = useState(Status.NOT_STARTED);
  const [isFetchingBalances, setIsFetchingBalances] = useState(false);
  const [modalIsOpen, setOpenModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [wrapAddressInput, setWrapAddressInput] = useState(false);



  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 858 && window.innerWidth < 1460) {
        setWrapAddressInput(true)
      } else {
        setWrapAddressInput(false)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener("resize", handleResize);
  })

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    if (web3) {
      web3.eth.transactionConfirmationBlocks = REQUIRED_CONFIRMATIONS;
    }
    window.ethereum.autoRefreshOnNetworkChange = false;
    window.ethereum.on("networkChanged", () => {
      // triggers checkNetwork() to be called again
      setHasCheckedNetwork(false);
    });
  }

  const checkNetwork = () => {
    getNetworkId(web3).then((id) => {
      if (!SUPPORTED_NETWORK_IDS.includes(id)) {
        wrongNetwork !== true && setWrongNetwork(true);
        setnetworkId(undefined);
      } else {
        wrongNetwork !== false && setWrongNetwork(false);
        setnetworkId(id);
      }
      setHasCheckedNetwork(true);
    });
  };

  if (!hasCheckedNetwork && web3) {
    checkNetwork();
  }

  const getUserBalance = () => {
    if (accounts.length > 0 && !wrongNetwork) {
      getBalances(web3, accounts[0]).then(([v1Balance, v2Balance, ethBalance]) => {
        if (v1Balance !== balances.v1Balance || v2Balance !== balances.v2Balance || ethBalance !== balances.ethBalance) {
          setBalance({ v1Balance, v2Balance, ethBalance });
        }
      });
    }
  };

  const refreshBalances = () => {
    setIsFetchingBalances(true);
    getUserBalance();
    setIsFetchingBalances(false);
  };

  const resetSendingState = () => {
    setSending(false);
    setHasHash(false);
    closeModal();
    setStep(0);
    props.setStep(SEND_TOKENS_STEP_INDEX);
  };

  const transferTokens = async () => {
    setSending(true);
    setOpenModal(true);

    await swapAllToken(
      web3,
      accounts[0],
      () => {
        resetSendingState();
        setStep(1);
        props.setStep(SEND_TOKENS_STEP_INDEX);
      },
      () => setHasHash(true),
      () => {
        // getUserAllowance();
        getUserBalance();
        resetSendingState();
        setStep(0);
        props.setStep(COMPLETE_PROCESS_STEP);
      }
    );
  };

  const handleCreateTransaction = async () => {
    transferTokens();
  };

  getUserBalance();

  const setRandomStatusMessaage = (): void => {
    if (step === 0 && !hasHash) {
      setStatusMessage("Accept in MetaMask");
    }
    else if (step === 1 && !hasHash) {
      setStatusMessage("Accept in MetaMask");
    }
    else {
      setStatusMessage(statusMessages[Math.floor(Math.random() * statusMessages.length)]);
    }

  }

  const changeStatusMessage = (): void => {
    setTimeout(() => setRandomStatusMessaage(), 30000);
  }

  const getPrimaryButtonText = () => {
    if (balances.ethBalance === "0" && balances.v1Balance === "0") {
      return "Insufficient TokenV1 and ETH balance";
    } else if (balances.ethBalance === "0") {
      return "Insufficient ETH baInslance";
    } else if (balances.v1Balance === "0") {
      return "Insfficient TokenV1 balance";
    }
    else if (step === 1 && !sending) {
      return "Send tokens";
    } else if (step === 1 && !hasHash) {
      return "Accept in MetaMask";
    } else {
      return "Sending tokens...";
    }
  };
  console.log({ sending })
  const getAllowanceText = () => {
    switch (allowanceStatus) {
      case Status.NOT_STARTED:
        return "Reset allowance to 0.";
      case Status.PENDING:
        return "Transaction to set allowance to 0 is being processed.";
      case Status.FAILED:
        return "Failed to reset the allowance.";
      default:
        return "An error occured.";
    }
  };

  if (awaiting || loading) {
    return (
      <VerticalContainer>
        <CircularProgress style={{ color: "#8E92FC" }} />
      </VerticalContainer>
    );
  }

  if (wrongNetwork) {
    return (
      <WarningMessage
        message={
          <div>
            <Typography color="textSecondary" variant="body1" align="center">
              Please connect MetaMask to a supported network.
            </Typography>
            <Typography color="textSecondary" variant="body1" align="center">
              Either to the Main Ethereum Network or to the Ropsten Test Network.
            </Typography>
          </div>
        }
      />
    );
  }

  if (accounts.length === 0) {
    return (
      <VerticalContainer>
        <Button variant="contained" color="primary" onClick={() => openMetaMask()}>
          Connect MetaMask
        </Button>
      </VerticalContainer>
    );
  }

  const closeModal = () => {
    setOpenModal(false);
    setStatusMessage('');
  }

  return (
    <React.Fragment>
      <Header label="Swap Token" />
      <Grid container justify="flex-end">
        <Grid item>
          <Button
            disableTouchRipple
            classes={{
              root: classes.refreshBtn,
              label: classes.refreshBtnLabel
            }}
            onClick={refreshBalances}
          >
            Refresh balance
            <RotateLeftIcon className={isFetchingBalances ? clsx(classes.rotationAnimation, classes.rotateIcon) : classes.rotateIcon} />
          </Button>
        </Grid>
      </Grid>
      <Paper className={classes.root} elevation={0}>
        <Grid container justify="center">
          <Grid container justify="center">
            <Grid item xs={12}>
              <div className={classes.paper}>
                <Typography color="textPrimary">
                  Ethereum{" "}
                  <Chip
                    size="small"
                    className={classes.chip}
                    label={SUPPORTED_NETWORK_NAMES[SUPPORTED_NETWORK_IDS.findIndex((pos) => pos === networkId)] || ""}
                  />{" "}
                  network
                </Typography>
                <Typography color="textPrimary" variant="body1">
                  Balance: {formatNumber(balances.ethBalance)} ETH
                </Typography>
              </div>
            </Grid>
          </Grid>

          <hr
            style={{
              borderTop: "1px solid #d3d3d3",
              height: "1px",
              width: "100%",
              marginTop: "12x",
              marginBottom: "12px"
            }}
          />

          <Grid container justify="center" alignContent="center" style={{ padding: "24px 16px" }}>
            <TokenInfoCard
              tokenName={V1_TOKEN_NAME}

              networkId={networkId}
              balance={formatNumber(balances.v1Balance)}
              address={getV1ContractAddress(networkId)}
              wrapAddress={wrapAddressInput}
              ChipProps={{
                label: "v1",
                color: "primary"
              }}
            // allowance={{
            //   allowanceStatus,
            //   allowance,
            //   allowanceText: getAllowanceText(),
            //   resetAllowance
            // }}
            />

            <TokenInfoCard
              tokenName={V2_TOKEN_NAME}
              networkId={networkId}
              balance={formatNumber(balances.v2Balance)}
              address={getV2ContractAddress(networkId)}
              wrapAddress={wrapAddressInput}
              ChipProps={{
                label: "v2",
                color: "secondary"
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <hr
        style={{
          borderTop: "1px solid #d3d3d3",
          height: "1px",
          width: "100%"
        }}
      />

      <Grid container>
        <Grid item xs={12}>
          <Typography className={classes.heading}>
            How to swap ERC 20
          </Typography>
          <Typography className={classes.descriptionText}>
            1. Make sure that the selected wallet in MetaMask contains tokens, and that the wallet is connected to this application.
            <br />
            2. To see your latest token/ETH balance, please click on the "Refresh balance <RotateLeftIcon style={{ marginBottom: "-6px" }} />" button.
            <br />
            3. Make sure that your wallet has sufficient ETH to start the token swap.
            <br />
            4. Please click the "Approve token transfer" button to allow this application to transfer all your tokens for this token swap. It will call the "approve" function on the tokens v1 contract so that the engine smart contract will be authorized to perform the "transfer from" function on your wallet. This step will not transfer any of your TokenV1.
            <br />
            5. Once step 3 is completed, please click on the "Send tokens" button to execute the token swap. Your tokens v1 will be removed from your wallet, and the tokens v2 will appear on your wallet.
          </Typography>
        </Grid>
      </Grid>

      <Grid container style={{ marginTop: "2rem" }}>
        <Grid item xs={12}>
          <Grid container justify="space-between">
            <ControlButton label="Back" disabled={loading || sending} onClick={props.previousStep} />

            <CustomPopover
              content={
                Number(allowance) > 0 && Number(allowance) < Number(balances.v1Balance)
                  ? `Your allowance does not cover the total amount of tokens you are trying to send. Either reset the allowance and then Approve the Token transfer again or make sure the amount you are sending is equal or less than the current allowance.`
                  : `There are not TokenV1 Token to transfer.`
              }
              shouldShow={(Number(allowance) > 0 && Number(allowance) < Number(balances.v1Balance)) || Number(balances.v1Balance) === 0}
            >
              <ControlButton
                label={getPrimaryButtonText()}
                disabled={
                  sending ||
                  Number(balances.v1Balance) < Number(balances.v1Balance) ||
                  Number(balances.v1Balance) === 0 ||
                  Number(balances.ethBalance) === 0 ||
                  (Number(allowance) > 0 && Number(allowance) < Number(balances.v1Balance)) ||
                  allowanceStatus === Status.PENDING
                }
                onClick={() => handleCreateTransaction()}
              />
            </CustomPopover>
          </Grid>
        </Grid>
      </Grid>
      <LoadingModal
        open={modalIsOpen}
        onClose={closeModal}
      >
        <div className={classes.modalRoot}>
          <div className={classes.modalContentWrapper} >
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem' }}>

              <CircularProgress color="primary" />
            </div>
            <div>
              {/* {setInterval(() => getRandomStatusMessaage(), 1000)} */}
              {changeStatusMessage()}
              {statusMessage}
            </div>
          </div>
        </div>
      </LoadingModal>
    </React.Fragment >
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: "transparent"
    },
    paper: {
      textAlign: "center",
      color: theme.palette.text.secondary,
      padding: "16px"
    },
    button: {
      border: "1px solid #77D1E2",
      padding: "2px 32px",
      color: "#77D1E2",
      borderRadius: "27px",
      textDecoration: "none",
      textTransform: "capitalize",
      fontWeight: "bold",
      "&:hover": {
        backgroundColor: "#77D1E2",
        color: "#FAFAFA"
      }
    },
    chip: {
      backgroundColor: theme.palette.primary.light,
      color: "#ffffff",
      padding: "14px 8px"
    },
    controlButtonWrapper: {
      width: "100%",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "baseline",
      marginTop: "3rem"
    },
    descriptionText: {
      fontSize: "14px"
    },
    heading: {
      fontSize: "16px",
      fontWeight: "bold",
      marginTop: "20px",
      marginBottom: "10px"
    },
    refreshBtn: {
      marginTop: "-16px",
      textTransform: "capitalize",
      // color: 'red',

      padding: "5px 14px 5px 28px",
      borderRadius: "27px",
      textDecoration: "none",
      width: "auto",
      transition: "all 0.3s",
      "&:hover": {
        backgroundColor: "transparent !important",
        transform: "scale(1.03)"
      },
      "&:active": {
        backgroundColor: "transparent !important",
        transform: "scale(0.98)"
      }
    },
    refreshBtnLabel: {
      color: "red"
    },
    rotateIcon: {
      marginTop: "0px",
      marginLeft: "6px",
      color: "#000000"
    },
    rotationAnimation: {
      animation: `$spin 2s linear infinite`
    },
    "@keyframes spin": {
      from: {
        transform: "rotate(0deg)"
      },
      to: {
        transform: "rotate(-360deg)"
      }
    },
    modalRoot: {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.87)',
      color: '#000000'
    },
    modalContentWrapper: {
      padding: '24px 32px',
      fontSize: '18px',
      border: '1px solid #2d2d2d',
      borderRadius: '8px',
      minWidth: '280px',
      // height: '120px',
      backgroundColor: '#2d2d2d',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }
  });


export default withStyles(styles)(UpgradeEngine);
