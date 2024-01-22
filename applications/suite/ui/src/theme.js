import {createMuiTheme} from "@material-ui/core/styles";
import {orange} from "@material-ui/core/colors";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#E5035A",
      light: "#8E92FC"
    },
    secondary: {
      main: "#3EA56E"
    },
    error: {
      main: orange[600]
    },
    background: {
      default: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)"
    }
  },
  typography: {
    fontFamily: `Open Sans, sans-serif`,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,

    subtitle1: {
      fontSize: 22
    },
    subtitle2: {
      fontSize: 18
    },
    body1: {
      fontSize: 18
    },
    body2: {
      fontSize: 20,
      color: "#111a4c"
    }
  }
});

export default theme;
