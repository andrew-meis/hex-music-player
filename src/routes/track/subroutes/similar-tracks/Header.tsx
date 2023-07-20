import { Avatar, Box, Fade, SvgIcon, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import React from 'react';
import { IoMdMicrophone } from 'react-icons/io';
import { useInView } from 'react-intersection-observer';
import { NavLink } from 'react-router-dom';
import { Track } from 'api/index';
import { ChipFilter } from 'components/chips';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { sortedTracksAtom } from 'components/track-table/TrackTable';
import { WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import FixedHeader from './FixedHeader';

const Header: React.FC<{
  filter: string,
  handlePlayNow: (key?: string, shuffle?: boolean, sortedItems?: Track[]) => Promise<void>,
  setFilter: React.Dispatch<React.SetStateAction<string>>,
  track: Track,
}> = ({
  filter,
  handlePlayNow,
  setFilter,
  track,
}) => {
  const sortedTracks = useAtomValue(sortedTracksAtom);
  const [thumbSrcSm] = useThumbnail(track.thumb || 'none', 100);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  const handlePlay = () => handlePlayNow(undefined, false, sortedTracks);
  const handleShuffle = () => handlePlayNow(undefined, true);

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          maxWidth="1600px"
          position="fixed"
          width={1}
          zIndex={400}
        >
          <FixedHeader
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            thumbSrcSm={thumbSrcSm}
            track={track}
          />
        </Box>
      </Fade>
      <Box
        mx="auto"
        ref={ref}
        width={WIDTH_CALC}
      >
        <Box
          alignItems="center"
          bgcolor="background.paper"
          color="text.primary"
          display="flex"
          height={70}
          marginX="auto"
          maxWidth="1600px"
          paddingX="6px"
        >
          <Avatar
            alt={track.title}
            src={track.thumb ? thumbSrcSm : ''}
            sx={{ width: 60, height: 60 }}
            variant="rounded"
          >
            <SvgIcon
              className="generic-icon"
              sx={{ color: 'common.black' }}
            >
              <IoMdMicrophone />
            </SvgIcon>
          </Avatar>
          <Typography
            alignSelf="center"
            ml="10px"
            variant="header"
            width={1}
          >
            <NavLink
              className="link"
              to={`/albums/${track.parentId}`}
            >
              {track.title}
            </NavLink>
            &nbsp;&nbsp;»&nbsp;&nbsp;Similar Tracks
          </Typography>
          <PlayShuffleButton
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
          />
        </Box>
        <Box
          alignItems="center"
          display="flex"
          height={72}
        >
          <ChipFilter
            filter={filter}
            setFilter={setFilter}
          />
        </Box>
      </Box>
    </>
  );
};

export default Header;
