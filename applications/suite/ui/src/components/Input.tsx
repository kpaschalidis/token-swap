import React from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

interface InputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  type: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexWrap: "wrap"
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200
    }
  })
);

export default function Input(props: InputProps) {
  const classes = useStyles();

  return (
    <TextField
      id="standard-basic"
      className={classes.textField}
      margin="normal"
      onChange={props.onChange}
      value={props.value}
      label={props.label}
      type={props.type}
    />
  );
}
