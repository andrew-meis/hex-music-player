import { Avatar, Box, Fade, SvgIcon, Typography } from '@mui/material';
import chroma from 'chroma-js';
import fontColorContrast from 'font-color-contrast';
import { Album } from 'hex-plex';
import React from 'react';
import { BiHash, RiHeartLine, RiTimeLine } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { useOutletContext } from 'react-router-dom';
import Palette from '../../components/palette/Palette';
import PlayShuffleButton from '../../components/play-shuffle-buttons/PlayShuffleButton';
import { useThumbnail } from '../../hooks/plexHooks';
import usePlayback from '../../hooks/usePlayback';
import { AlbumContext } from './Album';
import FixedHeader from './FixedHeader';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons',
  fontWeight: 600,
  marginBottom: '5px',
};

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: AlbumContext }) => {
  const { album: albumData, navigate } = context!;
  const { album } = albumData!;
  const { playAlbum } = usePlayback();
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });
  const { width } = useOutletContext() as { width: number };
  // calculated values
  const countNoun = album.leafCount > 1 || album.leafCount === 0 ? 'tracks' : 'track';
  const parentThumbSrc = useThumbnail(album.parentThumb || 'none', 100);
  const thumbSrc = useThumbnail(album.thumb || 'none', 300);
  const thumbSrcSm = useThumbnail(album.thumb || 'none', 100);
  const releaseDate = album.originallyAvailableAt
    .toLocaleDateString(
      'en-gb',
      { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
    );

  const handlePlay = () => playAlbum(album as Album);
  const handleShuffle = () => playAlbum(album as Album, true);

  if (!album) {
    return null;
  }

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={300}
      >
        <Box
          height={71}
          position="fixed"
          width={width}
          zIndex={400}
        >
          <FixedHeader
            album={album}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            thumbSrcSm={thumbSrcSm}
          />
        </Box>
      </Fade>
      <Box maxWidth="900px" mx="auto" ref={ref} width="89%">
        <Box alignItems="flex-end" color="text.primary" display="flex" height={232}>
          <Avatar
            alt={album.title}
            src={thumbSrc}
            sx={{
              height: 216, margin: '8px', ml: 0, width: 216,
            }}
            variant="rounded"
          />
          <Box alignItems="center" display="flex" flexGrow={1} mb="10px">
            <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
              <Box display="flex" height={18}>
                {[...album.format, ...album.subformat].map((item, index, { length }) => {
                  if (length - 1 === index) {
                    return (
                      <Typography key={item.id} variant="subtitle2">
                        {item.tag.toLowerCase()}
                      </Typography>
                    );
                  }
                  return (
                    <Typography key={item.id} variant="subtitle2">
                      {item.tag.toLowerCase()}
                      {' ·'}
                      &nbsp;
                    </Typography>
                  );
                })}
              </Box>
              <Typography sx={titleStyle} variant="h4">{album.title}</Typography>
              <Box alignItems="center" display="flex" height={32}>
                <Palette id={album.id} src={thumbSrc}>
                  {({ data: colors, isLoading }) => {
                    if (isLoading) {
                      return null;
                    }
                    return (
                      <Box
                        alignItems="center"
                        borderRadius="16px"
                        display="flex"
                        height="28px"
                        sx={{
                          background: !colors
                            ? 'active.selected'
                            : chroma(colors.lightVibrant).saturate(3).hex(),
                          cursor: 'pointer',
                          transition: 'box-shadow 200ms ease-in',
                          '&:hover': { boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.3)' },
                        }}
                        // TODO add artist link state
                        onClick={() => navigate(
                          `/artists/${album.parentId}`,
                          { state: { guid: album.parentGuid, title: album.parentTitle } },
                        )}
                      >
                        <Avatar
                          alt={album.parentTitle}
                          src={parentThumbSrc}
                          sx={{ width: '24px', height: '24px', ml: '2px' }}
                        />
                        <Typography
                          color={!colors
                            ? 'text.main'
                            : fontColorContrast(chroma(colors.lightVibrant).saturate(3).hex())}
                          fontSize="0.875rem"
                          ml="8px"
                          mr="12px"
                          whiteSpace="nowrap"
                        >
                          {album.parentTitle}
                        </Typography>
                      </Box>
                    );
                  }}
                </Palette>
              </Box>
              <Box alignItems="flex-end" display="flex" height={25}>
                <Typography
                  sx={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                  variant="subtitle2"
                  width="fit-content"
                >
                  {`${releaseDate} · ${album.leafCount} ${countNoun}${album.studio ? ` · ${album.studio}` : ''}`}
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
          <Box sx={{
            width: '50%', flexGrow: 1, display: 'flex', justifyContent: 'flex-end',
          }}
          >
            <span />
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
