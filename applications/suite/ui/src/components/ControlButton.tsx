import { makeStyles, createStyles, Button, Theme } from "@material-ui/core";

interface ControlButtonProps {
    label: string;
    disabled?: boolean | (() => boolean);
    onClick: () => void;
}

export const ControlButton = (props: ControlButtonProps) => {
    console.log({
        isFunction: typeof props.disabled
    })
    const classes = useStyles();

    return (
        <Button
            classes={{
                root: classes.button,
                disabled: classes.buttonDisabled
            }}
            onClick={props.onClick}
            disabled={typeof props.disabled === 'function' ? props.disabled() : props.disabled}>
            {props.label}
        </Button>
    );
}

const useStyles = makeStyles(() =>
    createStyles({

        button: {
            border: '1px solid #2d2d2d',
            padding: '4px 28px',
            color: '#111A4C',
            borderRadius: '27px',
            textDecoration: 'none',
            textTransform: 'capitalize',
            fontWeight: 600,
            width: 'auto',
            '&:hover': {
                backgroundColor: '#2d2d2d',
                color: '#FAFAFA'
            }
        },
        buttonDisabled: {
            borderColor: '#d3d3d3'
        }

    })
);