import { Drawer, IconButton, SvgIcon } from '@mui/material';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { MotionBox } from 'components/motion-components/motion-components';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';

export const drawerContainerAtom = atom<HTMLDivElement | null>(null);
export const tableKeyAtom = atom('');

const TbTableOptions = () => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h24v24H0z" fill="none" stroke="none" />
    <path d="M12 21h-7a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7" />
    <path d="M4 10h16" />
    <path d="M10 4v16" />
    <path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M19.001 15.5v1.5" />
    <path d="M19.001 21v1.5" />
    <path d="M22.032 17.25l-1.299 .75" />
    <path d="M17.27 20l-1.3 .75" />
    <path d="M15.97 17.25l1.3 .75" />
    <path d="M20.733 20l1.3 .75" />
  </svg>
);

const popperProps = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 0],
      },
    },
  ],
};

export const ColumnSettingsDrawer = () => {
  const setDrawerContainer = useSetAtom(drawerContainerAtom);
  const tableKey = useAtomValue(tableKeyAtom);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!tableKey) setOpen(false);
  }, [tableKey]);

  return (
    <>
      {!!tableKey && (
        <MotionBox
          animate={{ width: 32, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          initial={{ width: 0, opacity: 0 }}
          mr={0.5}
        >
          <Tooltip
            PopperProps={popperProps}
            placement="top"
            title="Columns"
          >
            <IconButton
              disableRipple
              size="small"
              sx={{
                ...iconButtonStyle,
                width: 32,
                height: 30,
                color: open ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: open ? 'primary.light' : 'text.primary',
                },
              }}
              onClick={() => setOpen(!open)}
            >
              <SvgIcon
                sx={{
                  position: 'absolute',
                  width: '0.9em',
                  height: '0.9em',
                }}
                viewBox="0 2 24 24"
              >
                <TbTableOptions />
              </SvgIcon>
            </IconButton>
          </Tooltip>
        </MotionBox>
      )}
      <Drawer
        PaperProps={{
          ref: setDrawerContainer,
          square: false,
          sx: {
            backgroundColor: 'var(--mui-palette-background-default)',
            backgroundImage: 'var(--mui-palette-common-overlay)',
          },
        }}
        anchor="right"
        open={!!tableKey && open}
        transitionDuration={300}
        variant="persistent"
      />
    </>
  );
};

export default ColumnSettingsDrawer;
