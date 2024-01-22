import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React from "react";
import { Header } from "../../../components/Header";
import { Stepper } from "../../../components/Stepper";
import UpgradeEngine from "../../../containers/UpgradeEngine";
import { AppContextConsumer } from "../../../context/application";

interface SwapProps {
    currentStep: number;
    totalSteps: number;
    setStep: (stepIndex: number) => void;
    previousStep: () => void;
}

const Swap = (props: SwapProps) => {
    const classes = useStyles();

    return (
        <div className={classes.root} >

            <Stepper currentStep={props.currentStep + 1} totalSteps={props.totalSteps} />

            <UpgradeEngine setStep={props.setStep} previousStep={props.previousStep} />
        </div>
    );
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: '100%',
            [theme.breakpoints.up('md')]: {
                // padding: '121px 138px 24px 173px',
                marginTop: '173px',
            }
        },
        header: {
            fontSize: "40px",
            fontWeight: 400,
            marginBottom: '1.35rem'
        },
        content: {
            fontSize: "22px",
        },
        buttonWrapper: {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
        },
        button: {
            marginTop: '2rem',
            border: '1px solid #77D1E2',
            padding: '0px 32px',
            color: '#77D1E2',
            borderRadius: '27px',
            textDecoration: 'none',
            textTransform: 'capitalize',
            '&:hover': {
                backgroundColor: '#77D1E2',
                color: '#FAFAFA'
            }
        },

    })
);
export { Swap };
