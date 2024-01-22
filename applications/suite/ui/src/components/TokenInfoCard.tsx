import React, { useRef } from 'react';
import { Grid, Typography, Chip, makeStyles, Theme, createStyles } from '@material-ui/core';
import { formatNumber } from '../utils';
import { Status } from '../types';
import FileCopyIcon from '@material-ui/icons/FileCopy';

interface Props {
  tokenName: string
  ChipProps: {
    color: 'primary' | 'secondary',
    label: string
  },
  address: string;
  wrapAddress: boolean
  networkId: number;
  balance: number;
  // allowance?: {
  //   allowanceStatus: Status;
  //   allowance: string;
  //   allowanceText: string;
  //   resetAllowance: () => void;
  // }
}

const TokenInfoCard = (props: Props) => {
  const classes = useStyles();
  const contractRef = useRef(null);

  const makeAddressString = (address: string, maxLength = 24) => {
    if (maxLength === 0) {
      return address;
    }
    return `${address.slice(0, maxLength)}...`;
  }

  function copyToClipboard(e: any) {
    // const copyText = contractRef.current.textContent;
    const textArea = document.createElement('textarea');
    textArea.value = contractRef.current.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
    // This is just personal preference.
    // I prefer to not show the whole text area selected.
  };

  const buildEtherscanURL = (address: string) => {
    if (props.networkId === 1) {
      return `https://etherscan.io/address/${address}`;
    }

    if (props.networkId === 3) {
      return `https://ropsten.etherscan.io/address/${address}`;
    }

    if (props.networkId === 4) {
      return `https://rinkeby.etherscan.io/address/${address}`;
    }

    return '';
  }

  const renderAddress = () => {
    const addressString = makeAddressString(props.address, props.wrapAddress ? 24 : 0);
    return (
      <span className={classes.addressWrapper}>
        @
        <a href={buildEtherscanURL(props.address)} target="_blank" style={{ textDecoration: 'none' }}>
          <span ref={contractRef} className={classes.address}>
            {addressString}
          </span>
        </a>
        <FileCopyIcon
          style={{ cursor: 'pointer', width: '14px', height: '14px', marginLeft: '4px', marginTop: '4px' }}
          onClick={copyToClipboard}
        />
      </span>
    );
  }

  return (
    <Grid item xs={12} md={6} className={classes.root}>
      <div className={classes.headerWrapper}>
        <Typography className={classes.header}>
          {props.tokenName}
        </Typography>
        <span style={{ marginRight: '4px' }} />
        <Chip size="small" label={props.ChipProps.label} color={props.ChipProps.color} style={{ fontWeight: 'bold' }} />
      </div>

      <Typography className={classes.address}>
        {renderAddress()}
      </Typography>
      <Typography className={classes.balance}>
        Balance: {formatNumber(props.balance)} {props.tokenName}
      </Typography>
    </Grid>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '1.8rem auto auto !important',
      [theme.breakpoints.up('md')]: {
        margin: '0.3rem auto 0 !important',
      }

    },
    allowanceLabel: {
      display: "flex",
      alignItems: "center",
      // justifyContent: "center",
      fontSize: '16px',
      fontWeight: 300,
      "& svg": {
        color: "orange",
        marginLeft: "5px",
        cursor: "pointer"
      }
    },
    rotationAnimation: {
      animation: `$spin 2s linear infinite`
    },
    "@keyframes spin": {
      from: {
        transform: "rotate(0deg)"
      },
      to: {
        transform: "rotate(-360deg)"
      }
    },
    paper: {
      borderRadius: '7px',
      minHeight: '120px',
      maxWidth: '520px',
      margin: 'auto',
    },
    headerWrapper: {
      display: 'flex',
      fontSize: '16px',
      fontWeight: 300,

    },
    header: {
      fontSize: '16px',
    },
    addressWrapper: {
      display: 'flex',
    },
    address: {
      overflow: 'hidden',
      color: '#77D1E2',
      fontSize: '14px',
      fontWeight: 300,
      resize: 'none',
      border: 'none',
      wordWrap: 'unset'

    },
    balance: {
      fontSize: '16px',
      fontWeight: 300,
    }
  })
);

export { TokenInfoCard };