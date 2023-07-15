import {
  Avatar,
  Box,
  Fade,
  SvgIcon,
  Typography,
} from '@mui/material';
import React from 'react';
import { BsMusicNoteList } from 'react-icons/bs';
import { useInView } from 'react-intersection-observer';
import { useOutletContext } from 'react-router-dom';
import { Playlist, PlaylistItem, Track } from 'api/index';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import FixedHeader from './FixedHeader';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons, sans-serif',
  fontWeight: 600,
};

const Header: React.FC<{
  handlePlayNow: (
    key?: string,
    shuffle?: boolean,
    sortedItems?: (PlaylistItem | Track)[],
  ) => Promise<void>,
  playlist: Playlist,
}> = ({
  handlePlayNow,
  playlist,
}) => {
  const { width } = useOutletContext() as { width: number };
  const countNoun = playlist.leafCount > 1 || playlist.leafCount === 0 ? 'tracks' : 'track';
  const [thumbSrc] = useThumbnail(playlist?.thumb || playlist?.composite || 'none', 300);
  const [thumbSrcSm] = useThumbnail(playlist?.thumb || playlist?.composite || 'none', 100);
  const { ref, inView, entry } = useInView({
    threshold: [0.99, 0],
  });

  const handlePlay = () => handlePlayNow();
  const handleShuffle = () => handlePlayNow(undefined, true);

  if (!playlist) {
    return null;
  }

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          position="fixed"
          width={width}
          zIndex={400}
        >
          <FixedHeader
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            playlist={playlist}
            thumbSrcSm={thumbSrcSm}
          />
        </Box>
      </Fade>
      <Box mx="auto" ref={ref} width={WIDTH_CALC}>
        <Box
          alignItems="flex-end"
          borderRadius="24px"
          color="text.primary"
          display="flex"
          height={272}
          position="relative"
          sx={{
            backgroundImage:
            /* eslint-disable max-len */
            `radial-gradient(circle at 115% 85%, rgba(var(--mui-palette-action-activeChannel) / 0.03), rgba(var(--mui-palette-action-activeChannel) / 0.08) 40%),
              radial-gradient(circle at 5% 5%, rgba(var(--mui-palette-action-activeChannel) / 0.01), rgba(var(--mui-palette-action-activeChannel) / 0.03) 70%)`,
            /* eslint-enable max-len */
          }}
          top={8}
        >
          <Avatar
            alt={playlist.title}
            src={playlist.thumb || playlist.composite
              ? thumbSrc
              : undefined}
            sx={{
              height: 236,
              m: '18px',
              width: 236,
            }}
            variant="rounded"
          >
            <SvgIcon
              sx={{
                alignSelf: 'center',
                color: 'common.black',
                height: '65%',
                width: '65%',
              }}
            >
              <BsMusicNoteList />
            </SvgIcon>
          </Avatar>
          <Box alignItems="flex-end" display="flex" flexGrow={1} mb="12px">
            <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
              <Box display="flex" height={18}>
                <Typography variant="subtitle2">
                  playlist
                </Typography>
              </Box>
              <Typography
                sx={titleStyle}
                variant="h4"
              >
                {playlist.title}
              </Typography>
              <Box alignItems="flex-end" display="flex" flexWrap="wrap" mt="4px">
                <Typography
                  fontFamily="Rubik, sans-serif"
                  sx={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                  variant="subtitle2"
                  width="fit-content"
                >
                  {`${playlist.leafCount} ${countNoun}`}
                </Typography>
              </Box>
            </Box>
            <PlayShuffleButton
              handlePlay={handlePlay}
              handleShuffle={handleShuffle}
              mr="10px"
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Header;
