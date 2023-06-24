import {
  SvgIcon, Tooltip, Zoom,
} from '@mui/material';
import React from 'react';
import { BiChevronRight } from 'react-icons/bi';
import { Result } from 'types/types';
import TooltipMenu from './TooltipMenu';

interface ResultTooltipProps {
  color: 'text.primary' | 'common.black'
  result: Result;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTooltipOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tooltipOpen: boolean;
}

const ResultTooltip = ({
  color, result, tooltipOpen, setOpen, setTooltipOpen,
}: ResultTooltipProps) => (
  <Tooltip
    arrow
    TransitionComponent={Zoom}
    componentsProps={{
      popper: {
        modifiers: [
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: true,
              padding: 8,
            },
          },
        ],
      },
      tooltip: {
        sx: {
          width: '156px',
          left: '-2px',
          padding: '4px 4px',
          backgroundColor: 'background.paper',
          backgroundImage: 'var(--mui-overlays-9)',
          boxShadow: 'var(--mui-shadows-8)',
          '& .MuiTooltip-arrow': {
            '&::before': {
              backgroundColor: 'background.paper',
              backgroundImage: 'var(--mui-overlays-9)',
            },
          },
        },
      },
    }}
    enterDelay={300}
    enterNextDelay={300}
    open={tooltipOpen}
    placement="right"
    sx={{ pointerEvents: 'auto' }}
    title={(
      <TooltipMenu
        result={result}
        setOpen={setOpen}
        setTooltipOpen={setTooltipOpen}
      />
    )}
    onClose={() => {
      setTooltipOpen(false);
      document.querySelector('.titlebar')?.classList.remove('titlebar-nodrag');
    }}
    onOpen={() => {
      setTooltipOpen(true);
      document.querySelector('.titlebar')?.classList.add('titlebar-nodrag');
    }}
  >
    <SvgIcon sx={{ color, height: '48px' }}>
      <BiChevronRight />
    </SvgIcon>
  </Tooltip>
);

export default ResultTooltip;
