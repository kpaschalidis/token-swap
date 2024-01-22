import React from 'react';
import { string } from 'prop-types';
import { Typography, createStyles, makeStyles, Theme } from '@material-ui/core';

interface HeaderProps {
    label: string;
}
export const Header = (props: HeaderProps) => {
    const classes = useStyles();

    return (
        <Typography className={classes.root} variant="body1">
            {props.label}
        </Typography>
    );
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            fontSize: "40px",
            color: "#000037",
            width: "100%"
        }
    })
);