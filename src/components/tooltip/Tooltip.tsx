/* eslint-disable react/destructuring-assignment */
import { Tooltip as MuiTooltip, TooltipProps, Typography } from '@mui/material';

const Tooltip = (props: TooltipProps) => (
  <MuiTooltip
    {...props}
    arrow
    enterDelay={500}
    enterNextDelay={300}
    placement={props.placement}
    title={(
      <Typography color="common.white" textAlign="center">
        {props.title}
      </Typography>
    )}
  >
    {props.children}
  </MuiTooltip>
);

export default Tooltip;
