import { Box, IconButton, SvgIcon } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CgChevronLeft, CgChevronRight } from 'react-icons/all';

interface SelectChipsProps {
  bgleft?: string;
  bgright?: string;
  children?: React.ReactNode;
  leftScroll?: boolean;
  maxWidth: number;
}

const SelectChips = React.forwardRef((
  { bgleft, bgright, children, leftScroll, maxWidth }: SelectChipsProps,
  ref,
) => {
  const [chipBox, setChipBox] = useState<HTMLDivElement | null>(null);
  const [chipScroll, setChipScroll] = useState(0);
  const scrollAtStart = chipScroll === 0;
  const scrollAtEnd = chipScroll === ((chipBox?.scrollWidth || 0) - (chipBox?.clientWidth || 1));

  useEffect(() => () => {
    if (chipBox && leftScroll) {
      const maxScroll = chipBox.scrollWidth - chipBox.clientWidth;
      setChipScroll(maxScroll);
      return;
    }
    setChipScroll(0);
  }, [chipBox, leftScroll]);

  useEffect(() => {
    if (chipBox && leftScroll) {
      const maxScroll = chipBox.scrollWidth - chipBox.clientWidth;
      chipBox.scrollLeft = maxScroll;
    }
  }, [chipBox, leftScroll]);

  return (
    <Box
      alignItems="center"
      borderRadius="8px"
      display="flex"
      gap="4px"
      maxWidth={maxWidth}
      overflow="hidden"
      ref={ref}
      sx={{
        contain: 'paint',
      }}
    >
      <Box
        borderRadius="10px"
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
            background: bgleft
            || `linear-gradient(to right, rgba(255,255,255, 0.12), transparent),
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
            background: bgright
            || `linear-gradient(to left, rgba(255,255,255, 0.12), transparent),
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
  );
});

SelectChips.defaultProps = {
  bgleft: undefined,
  bgright: undefined,
  children: undefined,
  leftScroll: false,
};

export default SelectChips;
