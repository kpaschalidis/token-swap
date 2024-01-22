import { Checkbox, createStyles, FormControlLabel, Grid, makeStyles, Theme } from "@material-ui/core";
import React from "react";
import { ControlButton } from "../../../components/ControlButton";
import { Header } from "../../../components/Header";
import { Stepper } from "../../../components/Stepper";

interface TermsOfServiceProps {
    currentStep: number;
    totalSteps: number;
    nextStep: () => void;
    previousStep: () => void;
}

const TermsOfServices = (props: TermsOfServiceProps) => {

    const [state, setState] = React.useState({ checked: false });


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    const classes = useStyles();

    return (
        <React.Fragment>
            <Grid container spacing={4} className={classes.root}>

                <Stepper currentStep={props.currentStep + 1} totalSteps={props.totalSteps} />

                <Header label="Terms of service" />

                <Grid item xs={12} className={classes.checkboxContainer}>
                    <FormControlLabel
                        control={<Checkbox checked={state.checked} onChange={handleChange} name="checked"
                            style={{ color: '#111A4C' }} />}
                        label={(
                            <label>
                                I have read and understood the {' '}
                                <a href='#'
                                    target="_blank"
                                    style={{
                                        textDecoration: 'none'
                                    }}
                                >Terms of service</a>
                            </label>
                        )}
                        style={{ marginTop: '2rem', textAlign: 'left' }}
                    />
                </Grid>

                <div className={classes.buttonWrapper} >
                    <ControlButton
                        label="Next"
                        disabled={!state.checked}
                        onClick={() => {
                            if (state.checked) {
                                props.nextStep()
                            }
                        }}
                    />
                </div>
            </Grid>
        </React.Fragment>
    );
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            [theme.breakpoints.up('md')]: {
                // padding: '121px 138px 24px 173px',
                marginTop: '173px',
                maxWidth: 1083
            }
        },
        header: {
            fontSize: "40px",
            color: "#000037"
        },
        content: {
            fontSize: "20px",
        },
        checkboxContainer: {
            padding: '0px !important',
            paddingTop: 16,
        },
        buttonWrapper: {
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'baseline',
            marginTop: '2rem'
        }
    })
);
export { TermsOfServices };
