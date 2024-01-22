import { createStyles, List, ListItem, makeStyles, Theme, Typography } from "@material-ui/core";
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined';
import clsx from 'clsx';
import Link from "next/link";
import React from "react";

interface SidebarProps {
    currentStep: number;
}

interface Step {
    label: string;
}

const steps: Step[] = [
    {
        label: 'Terms of service'
    },
    {
        label: 'FAQ'
    },
    {
        label: 'Guide'
    },
    {
        label: 'Swap Token'
    },
    {
        label: 'Process Completed'
    }
]

export const Sidebar = (props: SidebarProps) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <div className={classes.infoBox}>
                <Typography variant="h4" gutterBottom className={classes.header}>
                    Welcome.
                </Typography>
                <Link href="/">
                    <div className={classes.logoContainer} style={{ margin: 'auto', width: '100%', textAlign: "center" }} >
                        <img src={require('../../../assets/logo.jpg')}
                            style={{ height: '150px' }}
                        />
                    </div>
                </Link>
                <List className={classes.list}>
                    {steps.map(({ label }: Step, index: number) => (
                        <ListItem key={label} className={classes.listItem} >
                            <CheckCircleOutlinedIcon className={clsx(classes.listItemIcon, index < props.currentStep ? classes.stepCompleted : '')} />
                            <span className={clsx(classes.listItemText, index < props.currentStep ? classes.stepCompleted : '', index === props.currentStep ? classes.active : '')}>
                                {'  '} {label}
                            </span>
                        </ListItem>
                    ))}
                </List>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }} />

                <a href="#" target="_blank">
                    
                </a>
            </div>
        </React.Fragment>
    );
};

const useStyles = makeStyles((_theme: Theme) =>
    createStyles({
        infoBox: {
            padding: '76px 24px 24px 24px',
            color: '#00a0e3',
            minHeight: '96vh',
            height: '98%',
            backgroundColor: '#2d2d2d',
            borderRadius: '38px',
            position: 'relative' as 'relative'
        },
        header: {
            textAlign: 'center',
            marginBottom: '12px',
            color: '#E0E0E0'

        },
        logoContainer: {
            margin: 'auto',
            cursor: 'pointer'
        },
        list: {
            // marginTop: '124px',
            marginTop: '48px',
            marginLeft: '36px'
        },
        listItem: {
            color: '#d3d3d3',
            alignItems: 'flex-start',
            marginBottom: '12px'
        },
        listItemIcon: {
            color: '#E0E0E0',
            marginRight: '16px'
        },
        listItemText: {
            textDecoration: 'none',
            color: '#00a0e3',
            userSelect: 'none'
        },
        stepCompleted: {
            color: '#3CC4FC'
        },
        active: {
            fontSize: '20px',
            fontWeight: 'bold'
        },
        logo: {
            position: 'absolute',
            bottom: 0,
            margin: '32px auto 24px auto',
            left: 0,
            right: 0,
            display: 'none',
            '@media (min-height: 680px)': {
                display: 'block'
            }
        }

    })
);