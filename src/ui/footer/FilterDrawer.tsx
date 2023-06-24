import { Drawer, IconButton, SvgIcon } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
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
  const routes = useMemo(() => ['/artists', '/albums', '/tracks'], []);
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!routes.includes(location.pathname)) {
      setOpen(false);
    }
  }, [location, routes]);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  return (
    <>
      {routes.includes(location.pathname) && (
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
      )}
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
        <Filter pathname={location.pathname} />
      </Drawer>
    </>
  );
};

export default FilterDrawer;
