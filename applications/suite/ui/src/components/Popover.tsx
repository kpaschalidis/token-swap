import React from "react";
import Popover from "@material-ui/core/Popover";
import {makeStyles, createStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    popover: {
      pointerEvents: "none"
    },
    paper: {
      padding: theme.spacing(1),
      maxWidth: 350,
      fontSize: 14
    }
  })
);

interface IProps {
  children: React.ReactChild;
  content: React.ReactChild;
  shouldShow: boolean;
}

export default function MouseOverPopover(props: IProps) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <span>
      <span
        aria-owns={open ? "mouse-over-popover" : undefined}
        aria-haspopup="true"
        onMouseEnter={props.shouldShow ? handlePopoverOpen : undefined}
        onMouseLeave={props.shouldShow ? handlePopoverClose : undefined}
        style={{display: "flex"}}
      >
        {props.children}
      </span>
      <Popover
        id="mouse-over-popover"
        className={classes.popover}
        classes={{
          paper: classes.paper
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {props.content}
      </Popover>
    </span>
  );
}
