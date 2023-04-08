import { Avatar, Box, Fade, SvgIcon, Typography } from '@mui/material';
import { BiHash, RiHeartLine, RiTimeLine, BsMusicNoteList } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { useOutletContext } from 'react-router-dom';
import { Playlist } from 'api/index';
import FilterInput from 'components/filter-input/FilterInput';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import usePlayback from 'hooks/usePlayback';
import FixedHeader from './FixedHeader';
import { PlaylistContext } from './Playlist';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons',
  fontWeight: 600,
};

const Header = ({ context }: { context?: PlaylistContext | undefined }) => {
  const { filter, playlist, setFilter } = context!;
  const { playPlaylist } = usePlayback();
  const { width } = useOutletContext() as { width: number };
  const countNoun = playlist!.leafCount > 1 || playlist!.leafCount === 0 ? 'tracks' : 'track';
  const [thumbSrc] = useThumbnail(playlist?.thumb || playlist?.composite || 'none', 300);
  const [thumbSrcSm] = useThumbnail(playlist?.thumb || playlist?.composite || 'none', 100);
  const { ref, inView, entry } = useInView({
    threshold: [0.99, 0],
  });

  const handlePlay = () => playPlaylist(playlist as Playlist);
  const handleShuffle = () => playPlaylist(playlist as Playlist, true);

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
      <Box maxWidth="900px" mx="auto" ref={ref} width={WIDTH_CALC}>
        <Box alignItems="flex-end" color="text.primary" display="flex" height={232}>
          <Avatar
            alt={playlist.title}
            src={playlist.thumb || playlist.composite
              ? thumbSrc
              : undefined}
            sx={{
              height: 216, margin: '8px', ml: 0, width: 216,
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
          <Box alignItems="flex-end" display="flex" flexGrow={1} mb="10px">
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
                  fontFamily="Rubik"
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
            />
          </Box>
        </Box>
        <Box
          alignItems="flex-start"
          borderBottom="1px solid"
          borderColor="border.main"
          color="text.secondary"
          display="flex"
          height={30}
          width="100%"
        >
          <Box maxWidth="10px" width="10px" />
          <Box display="flex" flexShrink={0} justifyContent="center" width="40px">
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <BiHash />
            </SvgIcon>
          </Box>
          <Box sx={{ width: '56px' }} />
          <Box
            sx={{
              width: '50%', flexGrow: 1, display: 'flex', justifyContent: 'flex-end',
            }}
          >
            <FilterInput filter={filter} setFilter={setFilter} />
          </Box>
          <Box display="flex" flexShrink={0} justifyContent="flex-end" mx="5px" width="80px">
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <RiHeartLine />
            </SvgIcon>
          </Box>
          <Box sx={{
            width: '50px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0,
          }}
          >
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <RiTimeLine />
            </SvgIcon>
          </Box>
          <Box maxWidth="10px" width="10px" />
        </Box>
      </Box>
    </>
  );
};

Header.defaultProps = {
  context: undefined,
};

export default Header;
