import React, { Component } from 'react'
import { makeStyles, Theme, createStyles, Modal } from '@material-ui/core'
import theme from '../../theme'

interface Props {
    open: boolean;
    onClose: () => void;
    children?: any;
}
interface State {

}

const LoadingModal: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    return (

        <Modal
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="loading"
            aria-describedby="loading"
            disableBackdropClick
        >
            {props.children}
        </Modal>
    )

}

const useStyles = makeStyles((theme: Theme) => (
    createStyles({
    })
))


export { LoadingModal };