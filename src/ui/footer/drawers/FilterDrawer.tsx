import { Drawer, IconButton, SvgIcon } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';
import FilterPanel from 'ui/sidebars/filter-panel/FilterPanel';

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
        <MotionBox
          animate={{ width: 32, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          initial={{ width: 0, opacity: 0 }}
          mr={0.5}
        >
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
                width: 32,
                height: 30,
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
        </MotionBox>
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
        <FilterPanel pathname={location.pathname} />
      </Drawer>
    </>
  );
};

export default FilterDrawer;
