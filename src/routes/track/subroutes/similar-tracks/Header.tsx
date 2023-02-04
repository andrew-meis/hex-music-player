import { Avatar, Box, Fade, SvgIcon, Typography } from '@mui/material';
import { BiHash, IoMdMicrophone, RiHeartLine, RiTimeLine } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { NavLink } from 'react-router-dom';
import FilterInput from 'components/filter-input/FilterInput';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import FixedHeader from './FixedHeader';
import { SimilarTracksContext } from './SimilarTracks';

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: SimilarTracksContext }) => {
  const {
    currentTrack, filter, items, playTracks, setFilter,
  } = context!;
  const track = currentTrack!;
  const [thumbSrcSm] = useThumbnail(track.thumb || 'none', 100);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  const handlePlay = () => playTracks(items);
  const handleShuffle = () => playTracks(items, true);

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
        maxWidth="900px"
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
              className="generic-artist"
              sx={{ alignSelf: 'center', color: 'common.black', height: '65%', width: '65%' }}
            >
              <IoMdMicrophone />
            </SvgIcon>
          </Avatar>
          <Typography
            alignSelf="center"
            fontFamily="TT Commons"
            fontSize="1.75rem"
            fontWeight={600}
            ml="10px"
            variant="h5"
            width={1}
          >
            <NavLink
              className="link"
              to={`/albums/${track.parentId}`}
            >
              {track.title}
            </NavLink>
            &nbsp;&nbsp;»&nbsp;&nbsp;
            Similar Tracks
          </Typography>
          <PlayShuffleButton
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
          />
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
              alignItems: 'center',
              width: '50%',
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'flex-end',
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

export default Header;
