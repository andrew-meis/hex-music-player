import {
  SvgIcon, Tooltip, Zoom,
} from '@mui/material';
import React from 'react';
import { BiChevronRight } from 'react-icons/all';
import TooltipMenu from './TooltipMenu';
import type { Result } from 'types/types';

interface Props {
  result: Result;
  isTooltipOpen: boolean;
  setTooltipOpen: React.Dispatch<React.SetStateAction<boolean>>;
  color: 'text.primary' | 'common.black'
}

const ResultTooltip = ({
  result, isTooltipOpen, setTooltipOpen, color,
}: Props) => (
  <Tooltip
    arrow
    TransitionComponent={Zoom}
    componentsProps={{
      tooltip: {
        sx: {
          width: '152px',
          left: '-2px',
          padding: '5px 5px',
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
    open={isTooltipOpen}
    placement="right"
    sx={{ pointerEvents: 'auto' }}
    title={(
      <TooltipMenu
        open={isTooltipOpen}
        result={result}
        setOpen={setTooltipOpen}
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
