import {
  SvgIcon, Tooltip, useTheme, Zoom,
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
}: Props) => {
  const theme = useTheme();

  return (
    <Tooltip
      arrow
      TransitionComponent={Zoom}
      componentsProps={{
        tooltip: {
          sx: {
            width: '152px',
            left: '-2px',
            padding: '5px 5px',
            backgroundColor: theme.palette.background.paper,
            backgroundImage: theme.palette.mode === 'light'
              ? ''
              : `linear-gradient(
                  ${theme.palette.action.disabledBackground},
                  ${theme.palette.action.disabledBackground}
                )`,
            boxShadow:
              `0px 5px 5px -3px rgb(0 0 0 / 20%),
               0px 8px 10px 1px rgb(0 0 0 / 14%),
               0px 3px 14px 2px rgb(0 0 0 / 12%)`,
            '& .MuiTooltip-arrow': {
              '&::before': {
                backgroundColor: theme.palette.background.paper,
                backgroundImage: theme.palette.mode === 'light'
                  ? ''
                  : `linear-gradient(
                      ${theme.palette.action.disabledBackground},
                      ${theme.palette.action.disabledBackground}
                    )`,
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
};

export default ResultTooltip;
