import { Drawer, IconButton, SvgIcon } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BsViewList } from 'react-icons/all';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';
import { useSettings } from 'queries/app-queries';
import Queue from 'ui/sidebars/queue/Queue';

const drawerStyle = {
  width: '294px',
  marginTop: '54px',
  marginRight: '8px',
  height: 'calc(100vh - 154px)',
  border: '1px solid',
  backgroundColor: 'background.paper',
  paddingLeft: '4px',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
};

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

const QueueDrawer = () => {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(1);

  useEffect(() => {
    if (settings.dockedQueue) {
      setOpen(false);
      setIndex(1);
    }
  }, [settings]);

  const handleDrawerOpen = () => {
    setOpen(!open);
    if (open) {
      setTimeout(() => {
        setIndex(1);
      }, 300);
    }
  };

  return (
    <>
      <Tooltip
        PopperProps={popperProps}
        placement="top"
        title="Queue"
      >
        <IconButton
          disableRipple
          size="small"
          sx={{
            ...iconButtonStyle,
            display: settings.dockedQueue ? 'none' : 'inherit',
            marginRight: '4px',
            width: settings.dockedQueue ? '0px' : '32px',
            height: '30px',
            color: open ? 'primary.main' : 'text.secondary',
            '&:hover': {
              backgroundColor: 'transparent',
              color: open ? 'primary.light' : 'text.primary',
            },
          }}
          onClick={handleDrawerOpen}
        >
          <SvgIcon
            sx={{
              position: 'absolute',
              width: '0.9em',
              height: '0.9em',
            }}
            viewBox="0 6 24 24"
          >
            <BsViewList />
          </SvgIcon>
          <SvgIcon
            sx={{
              position: 'absolute',
              width: '0.9em',
              height: '0.9em',
            }}
            viewBox="0 -17 24 23"
          >
            <BsViewList />
          </SvgIcon>
        </IconButton>
      </Tooltip>
      <Drawer
        PaperProps={{
          square: false,
          sx: {
            ...drawerStyle,
            borderColor: 'border.main',
          },
        }}
        anchor="right"
        open={open}
        transitionDuration={300}
        variant="persistent"
      >
        {!settings.dockedQueue && (
          <Queue index={index} setIndex={setIndex} />
        )}
      </Drawer>
    </>
  );
};

export default QueueDrawer;
