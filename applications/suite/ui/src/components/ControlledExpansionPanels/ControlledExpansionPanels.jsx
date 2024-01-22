import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import React from 'react';


class ControlledExpansionPanels extends React.Component {
    state = {
        expanded: null
    };

    handleChange = (panel) => (event, expanded) => {
        this.setState({
            expanded: expanded ? panel : false
        });
    };

    getPanel(index, headline, content) {
        const { classes } = this.props;
        const { expanded } = this.state;

        return (
            <ExpansionPanel
                key={index}
                className={classes.root}
                expanded={expanded === `panel${index}`}
                elevation={0}
                onChange={this.handleChange(`panel${index}`)}
            >
                <ExpansionPanelSummary
                    classes={{
                        root: classes.summary,
                        content: classes.content,
                        expanded: classes.expanded,
                        disabled: classes.disabled
                    }}
                >
                    {this.props.showInfoIcon && <InfoIcon />}{' '}
                    {/* <Typography
                        classnames={classes.heading}
                    > */}
                    {headline}
                    {/* </Typography> */}
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.content}>
                    {/* eslint-disable react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                    {/* eslint-enable react/no-danger */}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }

    getPanels() {
        const { payload } = this.props;

        return payload.map((panel, index) => {
            return this.getPanel(index, panel[0], panel[1]);
        });
    }

    render() {
        const { classes } = this.props;

        return <div className={classes.root}>{this.getPanels()}</div>;
    }
}

const styles = (theme) => ({
    root: {
        width: '98%',
        backgroundColor: 'transparent',
        // fontFamily: `'Work Sans', sans-serif`,
        fontSize: '18px !important',
        '&::before': {
            display: 'none'
        },
        [theme.breakpoints.down('xs')]: {
            padding: '0px'
        }
    },
    icon: {
        fontSize: '40px'
    },
    content: {
        // boxShadow: 'none',
    },
    heading: {
        paddingRight: '0 !important',
        minWidth: '90%',

    },
    headingExpanded: {
    },
    summary: {
        fontSize: '20px !important',
        '&$expanded': {
            color: '#111A4C',
            fontWeight: 'bold'
        }
    },
    expanded: {},
    disabled: {}

});

export default withStyles(styles)(ControlledExpansionPanels);
