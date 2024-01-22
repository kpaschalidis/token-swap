import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import App from "next/app";
import Head from "next/head";
import React from "react";
import { MetamaskProvider } from '../src/context/metamask';
import theme from "../src/theme";
import { AppContextProvider } from "../src/context/application";

export default class MyApp extends App {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    const { statusCode } = pageProps;

    return (
      <React.Fragment>
        <Head>
          <title>Token Upgrade Engine</title>
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {/* This check is so that MetaMask isn't triggered for a URL that does not exist */}
          <AppContextProvider>
            <Component {...pageProps} />
          </AppContextProvider>
        </ThemeProvider>
      </React.Fragment>
    );
  }
}
