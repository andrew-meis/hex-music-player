import { Tooltip, TooltipProps } from '@mui/material';

interface ExtendedTooltipProps extends TooltipProps {
  maxWidth: number;
}

const SelectTooltip = ({ children, maxWidth, ...props }: ExtendedTooltipProps) => (
  <Tooltip
    arrow
    slotProps={{
      arrow: {
        sx: {
          backgroundColor: 'background.paper',
          '&::before': {
            backgroundColor: 'background.paper',
            backgroundImage: 'var(--mui-overlays-9)',
            boxShadow: `
              1px 1px 5px 1px rgba(0,0,0,0.2),
              0px 0px 80px 0px rgba(0,0,0,0.14),
              0px 0px 50px 4px rgba(0,0,0,0.12)
            `,
          },
        },
      },
      popper: {
        sx: {
          '&[data-popper-placement*="left"]': {
            '& .MuiTooltip-arrow': {
              mr: '-0.6em',
            },
          },
          '&[data-popper-placement*="right"]': {
            '& .MuiTooltip-arrow': {
              ml: '-0.6em',
            },
          },
        },
      },
      tooltip: {
        sx: {
          backgroundColor: 'background.paper',
          backgroundImage: 'var(--mui-overlays-9)',
          borderRadius: '24px',
          boxShadow: 'var(--mui-shadows-8)',
          maxWidth,
          padding: '4px',
        },
      },
    }}
    {...props}
  >
    {children}
  </Tooltip>
);

export default SelectTooltip;
