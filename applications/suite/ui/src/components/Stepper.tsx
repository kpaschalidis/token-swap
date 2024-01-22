import { Typography, Grid } from "@material-ui/core"

interface StepperProps {
    currentStep: number;
    totalSteps: number;
}
export const Stepper = (props: StepperProps) => {
    return (
        <Grid item xs={12} style={{ padding: 0, marginBottom: '0.35rem' }}>
            <div style={{ color: "#B2B2B2", fontSize: '14px' }}>STEP {`${props.currentStep} of ${props.totalSteps}`} </div>
        </Grid>
    )
}