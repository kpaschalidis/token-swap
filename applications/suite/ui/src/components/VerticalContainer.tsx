import React from "react";
import Grid from "@material-ui/core/Grid";

interface VerticalContainerProps {
  children: React.ReactNode;
}

const VerticalContainer = (props: VerticalContainerProps) => {
  return (
    <Grid container direction="column" alignItems="center" justify="center" style={{height: "20vh"}}>
      {props.children}
    </Grid>
  );
};

export default VerticalContainer;
