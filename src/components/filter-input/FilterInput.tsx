import {
  Box, ClickAwayListener, Collapse, Fade, IconButton, InputAdornment, InputBase, SvgIcon,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { FiFilter } from 'react-icons/all';

interface FilterInputProps {
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>
}

const FilterInput = ({ filter, setFilter }: FilterInputProps) => {
  const inputRef = useRef<HTMLInputElement | undefined>(null);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const handleClickAway = () => {
    if (open) {
      setOpen(!open);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        sx={{
          display: 'flex',
          color: 'text.main',
          transform: 'translateZ(0px)',
        }}
        title={open ? '' : 'Filter'}
      >
        <Collapse in={open} orientation="horizontal" sx={{ position: 'absolute', right: 0 }}>
          <Fade
            in={open}
            timeout={{ enter: 300, exit: 500 }}
            onEntered={() => inputRef.current?.focus()}
          >
            <Box
              bgcolor="action.selected"
              border="1px solid rgba(0, 0, 0, 0.12)"
              borderRadius="4px"
              width={200}
            >
              <InputBase
                autoFocus
                fullWidth
                color="secondary"
                inputProps={{ style: { padding: '2px 0 0' }, spellCheck: false }}
                inputRef={inputRef}
                placeholder="Filter"
                startAdornment={(
                  <InputAdornment position="end">
                    <SvgIcon sx={{
                      mr: '4px', mt: '2px', color: 'text.secondary', height: '18px', width: '18px',
                    }}
                    >
                      <FiFilter />
                    </SvgIcon>
                  </InputAdornment>
                )}
                sx={{ height: '26px' }}
                value={filter}
                onChange={handleChange}
                onFocus={(event) => event.target.select()}
              />
            </Box>
          </Fade>
        </Collapse>
        <Fade appear={false} in={!open} timeout={{ enter: 500, exit: 300 }}>
          <IconButton size="small" onClick={handleClick}>
            <SvgIcon
              sx={{
                color: filter === ''
                  ? 'text.secondary'
                  : 'primary.main',
                height: '18px',
                width: '18px',
              }}
            >
              <FiFilter />
            </SvgIcon>
          </IconButton>
        </Fade>
      </Box>
    </ClickAwayListener>
  );
};

export default FilterInput;
