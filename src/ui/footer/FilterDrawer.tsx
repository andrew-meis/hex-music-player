import { Drawer, IconButton, SvgIcon } from '@mui/material';
import { useState } from 'react';
import { FiFilter } from 'react-icons/all';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';
import Filter from 'ui/sidebars/filter/Filter';

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

const FilterDrawer = () => {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  return (
    <>
      <Tooltip
        PopperProps={popperProps}
        placement="top"
        title="Filters & Sorting"
      >
        <IconButton
          disableRipple
          size="small"
          sx={{
            ...iconButtonStyle,
            marginRight: '4px',
            width: '32px',
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
            viewBox="0 1 24 24"
          >
            <FiFilter />
          </SvgIcon>
        </IconButton>
      </Tooltip>
      <Drawer
        PaperProps={{
          square: false,
          sx: {
            backgroundColor: 'var(--mui-palette-background-default)',
            backgroundImage: 'var(--mui-palette-common-overlay)',
          },
        }}
        anchor="right"
        open={open}
        transitionDuration={300}
        variant="persistent"
      >
        <Filter />
      </Drawer>
    </>
  );
};

export default FilterDrawer;
