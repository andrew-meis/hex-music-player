import { Box, ClickAwayListener, IconButton, SvgIcon } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CgChevronLeft, CgChevronRight } from 'react-icons/all';

interface SelectChipsProps {
  children?: React.ReactNode;
  maxWidth: number;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SelectChips = ({
  children, maxWidth, setOpen,
}: SelectChipsProps) => {
  const [chipBox, setChipBox] = useState<HTMLDivElement | null>(null);
  const [chipScroll, setChipScroll] = useState(0);
  const scrollAtStart = chipScroll === 0;
  const scrollAtEnd = chipScroll === ((chipBox?.scrollWidth || 0) - (chipBox?.clientWidth || 1));

  useEffect(() => () => setChipScroll(0), []);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box
        alignItems="center"
        borderRadius="8px"
        display="flex"
        gap="4px"
        maxWidth={maxWidth}
        overflow="hidden"
        sx={{
          contain: 'paint',
        }}
      >
        <Box
          display="flex"
          flexGrow={1}
          gap="4px"
          maxWidth={maxWidth}
          overflow="hidden"
          ref={setChipBox}
          sx={{
            contain: 'paint',
          }}
          onScroll={(e) => {
            setChipScroll((e.target as HTMLDivElement).scrollLeft);
          }}
        >
          {children}
        </Box>
        {(chipBox?.scrollWidth || 0) > maxWidth && !scrollAtStart && (
          <Box
            alignItems="center"
            display="flex"
            height={1}
            justifyContent="flex-start"
            left={0}
            position="absolute"
            sx={{
              background:
              `linear-gradient(to right, rgba(255,255,255, 0.12), transparent),
              linear-gradient(to right, var(--mui-palette-background-paper), transparent)`,
              pointerEvents: 'none',
            }}
            width={96}
          >
            <Box
              sx={{
                backgroundColor: 'border.main',
                backgroundImage: 'var(--mui-overlays-9)',
                borderRadius: '50%',
                height: 32,
                width: 32,
              }}
            >
              <IconButton
                size="small"
                sx={{
                  height: 32,
                  pointerEvents: 'auto',
                  width: 32,
                }}
                onClick={() => {
                  chipBox?.scrollBy({ left: -200, behavior: 'smooth' });
                  setChipScroll(chipBox?.scrollLeft!);
                }}
              >
                <SvgIcon viewBox="1 0 24 24">
                  <CgChevronLeft />
                </SvgIcon>
              </IconButton>
            </Box>
          </Box>
        )}
        {(chipBox?.scrollWidth || 0) > maxWidth && !scrollAtEnd && (
          <Box
            alignItems="center"
            display="flex"
            height={1}
            justifyContent="flex-end"
            position="absolute"
            right={0}
            sx={{
              background:
              `linear-gradient(to left, rgba(255,255,255, 0.12), transparent),
              linear-gradient(to left, var(--mui-palette-background-paper), transparent)`,
              pointerEvents: 'none',
            }}
            width={96}
          >
            <Box
              sx={{
                backgroundColor: 'border.main',
                backgroundImage: 'var(--mui-overlays-9)',
                borderRadius: '50%',
                height: 32,
                width: 32,
              }}
            >
              <IconButton
                size="small"
                sx={{
                  height: 32,
                  pointerEvents: 'auto',
                  width: 32,
                }}
                onClick={() => {
                  chipBox?.scrollBy({ left: 200, behavior: 'smooth' });
                  setChipScroll(chipBox?.scrollLeft!);
                }}
              >
                <SvgIcon viewBox="1 0 24 24">
                  <CgChevronRight />
                </SvgIcon>
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
};

SelectChips.defaultProps = {
  children: undefined,
};

export default SelectChips;
