import { Avatar, Box, Fade, SvgIcon, Typography } from '@mui/material';
import chroma, { contrast } from 'chroma-js';
import { reduce } from 'lodash';
import moment from 'moment';
import React, { useEffect, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { IoMdMicrophone } from 'react-icons/io';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Album, Library, PlaylistItem, Track } from 'api/index';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC } from 'constants/measures';
import { PaletteState } from 'hooks/usePalette';
import { DragTypes } from 'types/enums';
import FixedHeader from './FixedHeader';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons, sans-serif',
  fontWeight: 600,
  marginBottom: '5px',
};

const Header: React.FC<{
  album: Album,
  colors: PaletteState,
  handlePlayNow: (
    key?: string,
    shuffle?: boolean,
    sortedItems?: (PlaylistItem | Track)[],
  ) => Promise<void>,
  library: Library,
}> = ({ album, colors, handlePlayNow, library }) => {
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });
  const { width } = useOutletContext() as { width: number };
  const countNoun = album.leafCount > 1 || album.leafCount === 0 ? 'tracks' : 'track';
  const navigate = useNavigate();
  const parentThumb = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.parentThumb,
      width: 100,
      height: 100,
      minSize: 1,
      upscale: 1,
    },
  );
  const releaseDate = moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY');
  const thumb = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb,
      width: 300,
      height: 300,
      minSize: 1,
      upscale: 1,
    },
  );
  const thumbSmall = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb,
      width: 100,
      height: 100,
      minSize: 1,
      upscale: 1,
    },
  );

  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.ALBUM,
    item: () => [album],
  }), [album]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, album]);

  const baseColor = useMemo(() => {
    const hsvBrightest = reduce(colors, (result, value) => (
      (chroma(value).get('hsv.v')) > (chroma(result).get('hsv.v')) ? value : result)) as string;
    let chromaColor = chroma(hsvBrightest);
    if (chromaColor.get('hsv.s') >= 0.4) {
      chromaColor = chromaColor.set('hsv.s', 0.4);
    }
    return chromaColor;
  }, [colors]);

  const color = chroma(baseColor).hex();
  const contrastMuted = contrast(color, 'black') > contrast(color, 'white')
    ? 'black'
    : 'white';
  const gradStart = baseColor.brighten(0.3).alpha(0.75).css();
  const gradEndOne = baseColor.saturate(0.3).alpha(0.75).css();

  const handlePlay = () => handlePlayNow();
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
          position="fixed"
          width={width}
          zIndex={400}
        >
          <FixedHeader
            album={album}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            thumbSrcSm={thumbSmall}
          />
        </Box>
      </Fade>
      <Box mx="auto" ref={ref} width={WIDTH_CALC}>
        <Box
          alignItems="flex-end"
          borderRadius="24px"
          color={contrastMuted}
          display="flex"
          height={272}
          position="relative"
          ref={drag}
          sx={{
            backgroundImage: `radial-gradient(circle at 50% -15%, ${gradStart}, ${gradEndOne} 80%)`,
          }}
          top={8}
        >
          <Avatar
            alt={album.title}
            src={thumb}
            sx={{
              height: 236,
              m: '18px',
              width: 236,
            }}
            variant="rounded"
          />
          <Box alignItems="flex-end" display="flex" flexGrow={1} mb="12px">
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
              <Box alignItems="center" display="flex" height={36}>
                <Box
                  alignItems="center"
                  borderRadius="16px"
                  display="flex"
                  height="36px"
                  sx={{
                    background: !colors ? 'active.selected' : color,
                    boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'box-shadow 200ms ease-in',
                    '&:hover': { boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.75)' },
                  }}
                  onClick={() => navigate(
                    `/artists/${album.parentId}`,
                    { state: { guid: album.parentGuid, title: album.parentTitle } },
                  )}
                >
                  <Avatar
                    alt={album.parentTitle}
                    src={album.parentThumb ? parentThumb : undefined}
                    sx={{ width: '32px', height: '32px', ml: '2px' }}
                  >
                    <SvgIcon className="generic-icon" sx={{ color: 'common.black' }}>
                      <IoMdMicrophone />
                    </SvgIcon>
                  </Avatar>
                  <Typography
                    color={!colors ? 'text.main' : contrastMuted}
                    fontSize="0.875rem"
                    ml="8px"
                    mr="12px"
                    whiteSpace="nowrap"
                  >
                    {album.parentTitle}
                  </Typography>
                </Box>
              </Box>
              <Box
                display="flex"
                flexWrap="wrap"
                height={22}
                justifyContent="center"
                mt="4px"
                overflow="hidden"
              >
                <Typography fontFamily="Rubik, sans-serif" variant="subtitle2">
                  {`${releaseDate} · ${album.leafCount} ${countNoun}`}
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
