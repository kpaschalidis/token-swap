import React from 'react';
import { canUseDOM } from '../utils/canUseDOM';
import { SWAP_UPGRADE_STATE } from '../constants';

export interface AppState {
    totalSteps: number;
    currentStep: number;
    nextStep: () => void;
    previousStep: () => void;
    setStep: (index: number) => void;
}

const initialState: AppState = {
    totalSteps: 6,
    currentStep: 0,
    nextStep: () => { },
    previousStep: () => { },
    setStep: (index: number) => { }
}
export const AppContext = React.createContext(initialState);

export const AppContextConsumer = AppContext.Consumer;

interface AppContextProviderProps {
    children: React.ReactNode;
}
interface AppContextProviderState {
    totalSteps: number;
    currentStep: number;
}
export class AppContextProvider extends React.Component<AppContextProviderProps, AppContextProviderState> {
    state = {
        totalSteps: 5,
        currentStep: 0,
    }

    componentDidMount() {
        const state = JSON.parse(localStorage.getItem(SWAP_UPGRADE_STATE));

        if (state) {
            this.setState({
                currentStep: state.currentStep
            })
        }
    }

    nextStep = () => {
        const currentStep = this.state.currentStep + 1;

        this.setState((state: AppContextProviderState) => {
            return {
                ...state,
                currentStep
            }
        });

        this.saveCurrentStep(currentStep)
    }

    previousStep = () => {
        const currentStep = this.state.currentStep - 1;
        this.setState((state: AppContextProviderState) => {
            return {
                ...state,
                currentStep
            }
        })
        this.saveCurrentStep(currentStep)
    }

    setStep = (index: number) => {
        this.setState({ currentStep: index });
        this.saveCurrentStep(index)
    }

    render() {
        return (
            <AppContext.Provider
                value={{
                    totalSteps: this.state.totalSteps,
                    currentStep: this.state.currentStep,
                    nextStep: this.nextStep,
                    previousStep: this.previousStep,
                    setStep: this.setStep,
                }}>

                {this.props.children}
            </AppContext.Provider>
        );
    }

    private saveCurrentStep = (stepIndex: number): void => {
        if (canUseDOM()) {
            const currentState =
                this.state.currentStep + 1 === this.state.totalSteps
                    ? { currentStep: 0 }
                    : { currentStep: stepIndex };

            localStorage.setItem(SWAP_UPGRADE_STATE, JSON.stringify(currentState));
        }
    }
}