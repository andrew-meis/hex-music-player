import {
  Box, Slide, SvgIcon, Typography,
} from '@mui/material';
import React, { useRef } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/all';
import PreviousTracksVirtuoso from './PreviousTracksVirtuoso';
import UpcomingTracksVirtuoso from './UpcomingTracksVirtuoso';

interface QueueProps {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
}

const Queue = ({ index, setIndex }: QueueProps) => {
  const slideContainer = useRef<HTMLDivElement>(null);

  return (
    <Box height={1} ref={slideContainer} sx={{ willChange: 'transform' }}>
      <Slide
        appear={false}
        container={slideContainer.current}
        direction="left"
        easing="ease-in"
        in={index === 1}
        timeout={300}
      >
        <Box height={1}>
          <Box
            alignItems="center"
            borderRadius="4px"
            color="text.primary"
            display="flex"
            justifyContent="space-between"
            paddingY="8px"
            width={1}
          >
            <SvgIcon
              sx={{
                transition: 'transform 200ms ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'scale(1.3)',
                },
              }}
              onClick={() => setIndex(0)}
            >
              <BiChevronLeft />
            </SvgIcon>
            <Typography fontSize="1.5rem" fontWeight={600} mr="8px">Queue</Typography>
          </Box>
          <UpcomingTracksVirtuoso />
        </Box>
      </Slide>
      <Slide
        container={slideContainer.current}
        direction="right"
        easing="ease-in"
        in={index === 0}
        timeout={300}
      >
        <Box
          height={1}
          left={0}
          position="absolute"
          top={0}
          width={1}
        >
          <Box
            alignItems="center"
            borderRadius="4px"
            color="text.primary"
            display="flex"
            justifyContent="space-between"
            paddingY="8px"
            width={1}
          >
            <Typography fontSize="1.5rem" fontWeight={600} ml="4px">Previous</Typography>
            <SvgIcon
              sx={{
                mr: '5px',
                transition: 'transform 200ms ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'scale(1.3)',
                },
              }}
              onClick={() => setIndex(1)}
            >
              <BiChevronRight />
            </SvgIcon>
          </Box>
          <PreviousTracksVirtuoso />
        </Box>
      </Slide>
    </Box>
  );
};

export default Queue;
