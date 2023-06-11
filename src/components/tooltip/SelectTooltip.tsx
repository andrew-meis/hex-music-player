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
            boxShadow: 'var(--mui-shadows-8)',
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
