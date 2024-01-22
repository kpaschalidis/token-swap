import React from "react";
import WarningIcon from "@material-ui/icons/Warning";
import VerticalContainer from "../components/VerticalContainer";

interface WarningMessageProps {
  message: string | React.ReactNode;
}

const WarningMessage = (props: WarningMessageProps) => {
  return (
    <VerticalContainer>
      <WarningIcon style={{color: "orange", height: "3em", width: "2em"}} />
      {"\n"}
      {props.message}
    </VerticalContainer>
  );
};

export default WarningMessage;
