import { createStyles, Grid, makeStyles, Theme, Typography, FormControlLabel, Checkbox } from "@material-ui/core";
import React from "react";
import { ControlButton } from "../../../components/ControlButton";
import { Header } from "../../../components/Header";
import { Stepper } from "../../../components/Stepper";
// import TermsAndConditions from "../../../assets/terms-and-conditions.pdf";
// import { Link } from "nextjs/common"
interface GuideProps {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
}

const Guide = (props: GuideProps) => {
  const [state, setState] = React.useState({
    walletWithTokens: false,
    usingSupportedBrowser: false,
    externalWallet: false
  });

  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log({ checkboxTargetName: event.target.name });
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const canProceedToNextStep = (): boolean => {
    if (state.walletWithTokens && state.usingSupportedBrowser && state.externalWallet) {
      return true;
    }
    return false;
  };
  return (
    <Grid container spacing={4} className={classes.root}>
      <Stepper currentStep={props.currentStep + 1} totalSteps={props.totalSteps} />

      <Header label="Guide" />

      
      <Typography className={classes.paragraph} variant="body2">
        You will have to authorize the transaction of all your current V1 token to the dedicated smart contract. After successful authorization, you can launch the token swap process to receive your v2 tokens.
      </Typography>

      <Typography variant="body2">Please check the following requirements before proceeding with the next step:</Typography>

      <Grid item xs={12} className={classes.checkboxContainer}>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <Checkbox checked={state.walletWithTokens} onChange={handleChange} name="walletWithTokens" style={{ marginTop: "-9px", color: "#111A4C" }} />
          <span>I have my wallet (e.g. private keys or hardware wallets) that holds the v1 token.</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <Checkbox checked={state.usingSupportedBrowser} onChange={handleChange} name="usingSupportedBrowser" style={{ marginTop: "-9px", color: "#111A4C" }} />
          <span>
            I am using Chrome/Firefox/Brave browser with MetaMask extension or MetaMask mobile app.
            <p style={{ color: "grey", fontSize: "0.8em", margin: "5pt 0pt" }}>
              To quickly start with Metamask, please check our{" "}
              <a href="/MetaMask_Instruction.pdf" target="_blank" className={classes.link}>
                MetaMask instruction pdf
              </a>
              . To download MetaMask, please go to{" "}
              <a href="https://metamask.io/download.html" target="_blank" className={classes.link}>
                https://metamask.io/download.html
              </a>
              .
            </p>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <Checkbox checked={state.externalWallet} onChange={handleChange} name="externalWallet" style={{ marginTop: "-9px", color: "#111A4C" }} />
          <span>My wallet with the v1 tokens is imported (with private key) or connected (for Ledger/Trezor hardware wallet) to MetaMask.</span>
        </div>
      </Grid>

      <Grid item xs={12}>
        <Typography>
          <a href="/user-guide.pdf" target="_blank" className={classes.link}>
            Download this guide here
          </a>
        </Typography>
      </Grid>

      <div className={classes.buttonWrapper}>
        <ControlButton label="Back" onClick={props.previousStep} />
        <ControlButton label="Proceed" disabled={!canProceedToNextStep()} onClick={props.nextStep} />
      </div>
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.up("md")]: {
        marginTop: "173px"
      }
    },
    header: {
      fontSize: "40px",
      marginBottom: "2rem"
    },
    paragraph: {
      fontSize: "20px",
      marginBottom: "1.7rem"
    },
    link: {
      textDecoration: "none"
    },
    checkboxContainer: {
      padding: "0px !important",
      marginTop: "16px"
    },
    buttonWrapper: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginTop: "2rem"
    }
  })
);
export { Guide };
