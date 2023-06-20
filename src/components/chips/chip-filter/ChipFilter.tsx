import { ClickAwayListener, Chip, SvgIcon, InputBase } from '@mui/material';
import React, { useRef, useState } from 'react';
import { FiFilter } from 'react-icons/all';
import { MotionBox } from 'components/motion-components/motion-components';

interface ChipFilterProps {
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>
}

const ChipFilter = ({ filter, setFilter }: ChipFilterProps) => {
  const inputRef = useRef<HTMLInputElement | undefined>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleClickAway = () => {
    if (filter.length > 0) return;
    setFilterOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Chip
        color="primary"
        label={(
          <MotionBox
            alignItems="center"
            animate={{
              width: filterOpen ? 200 : 18,
            }}
            color="var(--mui-palette-primary-contrastText)"
            display="flex"
            flexDirection="row-reverse"
            overflow="hidden"
            transition={{ ease: 'easeIn', duration: 0.2 }}
          >
            <SvgIcon
              sx={{ height: '0.75em', width: '0.75em' }}
              viewBox="0 -1 24 24"
            >
              <FiFilter />
            </SvgIcon>
            {filterOpen && (
              <InputBase
                autoFocus
                fullWidth
                inputProps={{
                  sx: {
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    padding: '0',
                    '&::placeholder': {
                      color: 'var(--mui-palette-primary-contrastText)',
                      opacity: 1,
                    },
                  },
                  spellCheck: false,
                }}
                inputRef={inputRef}
                placeholder="Filter"
                sx={{
                  color: 'var(--mui-palette-primary-contrastText)',
                  height: '26px',
                }}
                value={filter}
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()}
                onFocus={(event) => event.target.select()}
              />
            )}
          </MotionBox>
        )}
        sx={{
          fontSize: '0.9rem',
          '&:hover.Mui-focusVisible': {
            backgroundColor: 'var(--mui-palette-primary-light)',
          },
          '&.Mui-focusVisible': {
            backgroundColor: 'var(--mui-palette-primary-main)',
          },
        }}
        onClick={() => setFilterOpen(!filterOpen)}
      />
    </ClickAwayListener>
  );
};

export default ChipFilter;
