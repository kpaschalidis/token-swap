import { createStyles, Grid, makeStyles, Theme, Typography } from "@material-ui/core";
import React, { useContext, useState } from "react";
import { ControlButton } from "../../../components/ControlButton";
import { Header } from "../../../components/Header";
import { Stepper } from "../../../components/Stepper";
import { TokenInfoCard } from "../../../components/TokenInfoCard";
import { SUPPORTED_NETWORK_IDS } from "../../../constants";
import { MetamaskContext } from "../../../context/metamask";
import { getBalances, getNetworkId, getV2ContractAddress } from "../../../lib/web3";
import { Balance } from "../../../types";
import { formatNumber } from "../../../utils";

interface CompleteProcessProps {
  currentStep: number;
  totalSteps: number;
  previousStep: () => void;
}

const CompleteProcess = (props: CompleteProcessProps) => {
  const [networkId, setnetworkId] = useState<undefined | number>(undefined);
  const [balances, setBalance] = useState<Balance>({ v1Balance: "", v2Balance: "", ethBalance: "" });
  const { accounts, awaiting, openMetaMask, web3 } = useContext(MetamaskContext);
  const [hasCheckedNetwork, setHasCheckedNetwork] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(true);

  const classes = useStyles();

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

  getUserBalance();

  return (
    <React.Fragment>
      <Grid container spacing={4} className={classes.root}>
        <Stepper currentStep={props.currentStep + 1} totalSteps={props.totalSteps} />

        <Header label="Process Completed" />

        <Grid item xs={12} className={classes.content}>
          <Typography className={classes.content} gutterBottom>
            Congratulations! Your token swap succeeded. Your current balance of v2 is {formatNumber(balances.v2Balance)}. Thank you for using
            the swap engine.
          </Typography>
        </Grid>

        <div className={classes.buttonWrapper}>
          <ControlButton label="Back" onClick={props.previousStep} />
        </div>
      </Grid>
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.up("md")]: {
        marginTop: "173px",
        maxWidth: 1083
      }
    },
    header: {
      fontSize: "40px",
      color: "#000037"
    },
    tokenCardInfoWrapper: {
      marginTop: "2rem",
      marginBottom: "2rem",
      border: "1px solid #2d2d2d",
      borderRadius: "8px"
    },
    content: {
      padding: "0px !important"
    },
    buttonWrapper: {
      width: "100%",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "baseline",
      marginTop: "2rem"
    }
  })
);
export { CompleteProcess };
