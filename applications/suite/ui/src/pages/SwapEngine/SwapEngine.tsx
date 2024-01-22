
// import Container from "@material-ui/core/Container";
import { Theme, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import { NextRouter, withRouter } from "next/dist/client/router";
import Link from "next/link";
import React from "react";
import { COMPLETE_PROCESS_STEP } from '../../constants';
import { AppContextConsumer, AppState } from "../../context/application";
import { MetamaskConsumer, MetamaskProvider } from "../../context/metamask";
import { CompleteProcess } from "./CompleteProcess/CompleteProcess";
import { FAQ } from "./FAQ/FAQ";
import { Guide } from "./Guide/Guide";
import { Sidebar } from "./Sidebar/Sidebar";
import { Swap } from "./Swap/Swap";
import { TermsOfServices } from './TermsOfServices/TermsOfServices';
import { getNetworkNameById } from "../../utils/network-util";

interface SwapEnginePageProps {
    classes: any;
    router: NextRouter;
}
interface SwapEnginePageState {
    step: number;
}

const getInitialStep = (): number => {
    return 4;
}

class SwapEnginePageComponent extends React.Component<SwapEnginePageProps, SwapEnginePageState> {

    renderPanel = (context: AppState): React.ReactNode => {
        const { currentStep } = context;
        console.log({ currentStep })

        if (currentStep === 0) {
            return <TermsOfServices
                currentStep={context.currentStep}
                totalSteps={context.totalSteps}
                nextStep={context.nextStep}
                previousStep={context.previousStep}
            />
        }

        if (currentStep === 1) {
            return <FAQ
                currentStep={context.currentStep}
                totalSteps={context.totalSteps}
                nextStep={context.nextStep}
                previousStep={context.previousStep}
            />
        }

        if (currentStep === 2) {
            return <Guide
                currentStep={context.currentStep}
                totalSteps={context.totalSteps}
                nextStep={context.nextStep}
                previousStep={context.previousStep}
            />
        }

        if (currentStep === 3) {
            return <Swap
                currentStep={context.currentStep}
                totalSteps={context.totalSteps}
                setStep={context.setStep}
                previousStep={context.previousStep}
            />
        }

        if (currentStep === 4 || currentStep === COMPLETE_PROCESS_STEP) {
            return <CompleteProcess
                currentStep={context.currentStep}
                totalSteps={context.totalSteps}
                previousStep={context.previousStep}
            />
        }

        console.error('Step value is wrong.');
        return null;
    }

    render() {
        const { classes } = this.props;

        return (
            <MetamaskProvider
                imediate
                autoRefreshOnNetworkChange
                supportedNetworks={[1, 3]}
                transactionConfirmationBlocks={6}>
                <AppContextConsumer>
                    {(appContext) => (
                        <MetamaskConsumer>
                            {(metamaskContext) => (


                                <div className={classes.root}>
                                    <div className={classes.contentWrapper}>
                                        <div className={classes.left}>
                                            <Sidebar currentStep={appContext.currentStep} />
                                        </div>
                                        <div className={classes.right}>
                                            {parseInt(metamaskContext.networkId) !== 1 &&
                                                <Typography className={classes.note}>
                                                    Note: You are currently connected to a test network ({getNetworkNameById(parseInt(metamaskContext.networkId))}).
                                                </Typography>
                                            }
                                            <div className={classes.mainContentWrapper}>
                                                <div className={classes.logoWrapper}>
                                                    <Typography variant="h4" gutterBottom className={classes.header}>
                                                        Welcome to
                                                    </Typography>

                                                    <Link href="/">
                                                        <div className={classes.logoContainer} style={{ margin: 'auto', width: '283.27px' }} >
                                                            <img src={require('../../assets/logo.jpg')}
                                                                style={{ height: '125.84px' }}
                                                            />
                                                        </div>
                                                    </Link>
                                                </div>
                                                {this.renderPanel(appContext)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </MetamaskConsumer>
                    )}
                </AppContextConsumer>
            </MetamaskProvider>
        );
    }
};

const styles = (theme: Theme) => ({
    root: {
        minHeight: '100vh',
        padding: '18px',
    },
    contentWrapper: {
        height: '100%',
        borderTop: 'none',
        borderLeft: 'none',
        boarderRadius: '8%',
        display: 'flex'
    },

    left: {
        ght: '96vh',
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'block',
            minWidth: '392px'
        },
        [theme.breakpoints.up('lg')]: {
            display: 'block',
            minWidth: '486px'
        }
    },
    right: {
        width: '100%',
        minHeight: '96vh'
    },
    note: {
        marginTop: '8px',
        marginBottom: '-20px',
        textAlign: 'center' as 'center',
        fontSize: '14px'
    },
    infoBox: {
        padding: '76px 24px 24px 24px',
        color: '#6A6E82',
        minHeight: '96vh',
        height: '100%',
        borderRadius: '38px',

    },
    mainContentWrapper: {
        height: '100%',
        padding: '24px 48px 36px 76px',
        backgroundColor: '#ffffff',
        borderRadius: '38px',
        [theme.breakpoints.up('lg')]: {
            marginLeft: '14px'
        }
    },

    logoWrapper: {
        marginBottom: '4rem',
        display: 'block',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    header: {
        textAlign: 'center' as 'center',
        marginBottom: '12px',
        color: '#3B3B3B'

    },
    logoContainer: {
        margin: 'auto',
        marginBottom: '24px',
        cursor: 'pointer'
    }
});

const StyledSwapEnginePageComponent = withStyles(styles)(SwapEnginePageComponent);

const SwapEnginePage = withRouter(StyledSwapEnginePageComponent);

export { SwapEnginePage };
