import { Box } from '@mui/material';
import { AnimateSharedLayout } from 'framer-motion';
import React from 'react';
import { MotionBox } from 'components/motion-components/motion-components';

interface PaginationDotsProps {
  activeIndex: number;
  array: any[];
  colLength: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const PaginationDots = ({ activeIndex, array, colLength, setActiveIndex }: PaginationDotsProps) => (
  <AnimateSharedLayout>
    <Box
      alignItems="center"
      display="flex"
      flex="1 1 100%"
      height={32}
      justifyContent="center"
    >
      {array.map((_item, index) => {
        if (array.length <= colLength) return null;
        if (index % colLength !== 0) return null;
        return (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            padding="12px"
            sx={{ cursor: 'pointer' }}
            onClick={() => setActiveIndex(index / colLength)}
          >
            <Box
              bgcolor="action.disabled"
              borderRadius="50%"
              height={8}
              width={8}
            >
              {(index / colLength) === activeIndex && (
                <MotionBox
                  layoutId="highlight"
                  sx={{
                    backgroundColor: 'text.secondary',
                    borderRadius: '50%',
                    height: 12,
                    width: 12,
                    position: 'relative',
                    top: '-2px',
                    left: '-2px',
                  }}
                />
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  </AnimateSharedLayout>
);

export default PaginationDots;
