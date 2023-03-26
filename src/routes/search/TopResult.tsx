/* eslint-disable no-underscore-dangle */
import {
  Avatar, Box, SvgIcon, Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { FaTags, IoMdMicrophone } from 'react-icons/all';
import { Link } from 'react-router-dom';
import usePalette, { defaultColors } from 'hooks/usePalette';
import { useLibrary, useSettings } from 'queries/app-queries';
import { DragTypes, PlexSortKeys, SortOrders } from 'types/enums';
import { isAlbum, isArtist, isGenre, isPlaylist, isTrack } from 'types/type-guards';
import { Result } from 'types/types';
import TopResultButtons from './TopResultButtons';

const typographyStyle = {
  overflow: 'hidden',
  marginLeft: '9px',
  lineHeight: 1.2,
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
};

const textStyle = {
  backgroundColor: 'grey.800',
  color: 'common.white',
  borderRadius: '4px',
  position: 'absolute',
  bottom: 9,
  left: 9,
  paddingX: '3px',
  paddingY: '2px',
};

const getDragType = (resultType: string) => {
  switch (resultType) {
    case 'artist':
      return DragTypes.ARTIST;
    case 'album':
      return DragTypes.ALBUM;
    case 'genre':
      return DragTypes.GENRE;
    case 'playlist':
      return DragTypes.PLAYLIST;
    case 'track':
      return DragTypes.TRACK;
    default: throw new Error('no matching type');
  }
};

interface TopResultProps {
  topResult: Result;
}

const TopResult = ({ topResult }: TopResultProps) => {
  const box = useRef<HTMLDivElement>(null);
  const library = useLibrary();
  const { data: settings } = useSettings();
  const { colorMode } = settings;

  const thumbSrc = useMemo(() => {
    if (isGenre(topResult)) return { src: undefined, url: undefined };
    if (isPlaylist(topResult) && (topResult.thumb || topResult.composite)) {
      const url = library.api.getAuthenticatedUrl(
        '/photo/:/transcode',
        {
          url: topResult.thumb || topResult.composite,
          width: 300,
          height: 300,
          minSize: 1,
          upscale: 1,
        },
      );
      return { src: topResult.thumb || topResult.composite, url };
    }
    if (!topResult.thumb) return { src: undefined, url: undefined };
    const url = library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: topResult.thumb,
        width: 300,
        height: 300,
        minSize: 1,
        upscale: 1,
      },
    );
    return { src: topResult.thumb, url };
  }, [library, topResult]);

  const { data: palette, isError } = usePalette(thumbSrc.src || '', thumbSrc.url || '');

  const [, drag, dragPreview] = useDrag(() => ({
    type: getDragType(topResult._type),
    item: [topResult],
  }), [topResult]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, topResult]);

  const additionalText = useMemo(() => {
    if (isArtist(topResult)) {
      return topResult.childCount > 1
        ? `${topResult.childCount} releases`
        : `${topResult.childCount} release`;
    }
    if (isAlbum(topResult)) {
      return topResult.parentTitle;
    }
    if (isTrack(topResult)) {
      return topResult.originalTitle
        ? topResult.originalTitle
        : topResult.grandparentTitle;
    }
    if (isPlaylist(topResult)) {
      const { leafCount } = topResult;
      return `${leafCount} ${leafCount > 1 || leafCount === 0 ? 'tracks' : 'track'}`;
    }
    if (isGenre(topResult)) {
      return '';
    }
    throw new Error('no matching type');
  }, [topResult]);

  const linkState = useMemo(() => {
    if (isArtist(topResult)) {
      return {
        guid: topResult.guid,
        title: topResult.title,
        sort: [
          PlexSortKeys.RELEASE_DATE,
          SortOrders.DESC,
        ].join(''),
      };
    }
    if (isAlbum(topResult)) {
      return { guid: topResult.parentGuid, title: topResult.parentTitle };
    }
    if (isTrack(topResult)) {
      return { guid: topResult.grandparentGuid, title: topResult.grandparentTitle };
    }
    if (isPlaylist(topResult)) {
      return {};
    }
    if (isGenre(topResult)) {
      return { title: topResult.title };
    }
    throw new Error('no matching type');
  }, [topResult]);

  const fontSize = useMemo(() => {
    switch (true) {
      case topResult.title.length > 55:
        return '1.4rem';
      case topResult.title.length > 35:
        return '1.6rem';
      case topResult.title.length > 15:
        return '1.8rem';
      case topResult.title.length <= 15:
        return '2.0rem';
      default: return '2.0rem';
    }
  }, [topResult.title.length]);

  const resultType = useMemo(() => {
    switch (topResult._type) {
      case 'artist':
        return (
          <Typography fontSize="0.75rem" letterSpacing="0.5px" sx={textStyle}>artist</Typography>
        );
      case 'album':
        return (
          <Typography fontSize="0.75rem" letterSpacing="0.5px" sx={textStyle}>album</Typography>
        );
      case 'track':
        return (
          <Typography fontSize="0.75rem" letterSpacing="0.5px" sx={textStyle}>track</Typography>
        );
      case 'playlist':
        return null;
      default:
        return null;
    }
  }, [topResult._type]);

  const backgroundColor = useMemo(() => {
    if (isError || !palette) {
      return colorMode === 'light'
        ? `${defaultColors.lightVibrant}66`
        : `${defaultColors.lightVibrant}e6`;
    }
    return colorMode === 'light'
      ? `${palette.lightVibrant}66`
      : `${palette.lightVibrant}e6`;
  }, [colorMode, isError, palette]);

  return (
    <Box
      borderRadius="12px"
      height="calc(100% - 71px)"
      ref={drag}
      sx={{
        borderRadius: '8px',
        backgroundColor,
        backgroundImage: 'var(--mui-palette-common-overlay)',
        contain: 'paint',
        transition: 'color 200ms ease-in, background-color 200ms ease-in',
      }}
      width={1}
    >
      <Box
        ref={box}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '100%',
          width: '100%',
        }}
      >
        <Avatar
          alt={topResult.title}
          src={thumbSrc.url}
          sx={{
            borderRadius: topResult._type === 'artist' ? '50%' : '4px',
            height: 295 - 71 - 12,
            mb: '6px',
            ml: '6px',
            width: 295 - 71 - 12,
          }}
          variant="rounded"
        >
          <SvgIcon className="generic-icon" sx={{ color: 'common.black' }}>
            {isGenre(topResult) ? <FaTags /> : null}
            {isArtist(topResult) ? <IoMdMicrophone /> : null}
          </SvgIcon>
        </Avatar>
        {resultType}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <Box
            id="top-result-text"
            sx={{
              overflow: 'hidden',
              marginRight: '3px',
            }}
          >
            <Typography
              sx={{
                ...typographyStyle,
                color: 'common.black',
                fontFamily: 'Rubik, sans-serif',
                fontSize,
                fontWeight: 700,
              }}
            >
              <Link
                className="link"
                state={isArtist(topResult) || isGenre(topResult) ? linkState : null}
                to={{
                  artist: isArtist(topResult) ? `/artists/${topResult.id}` : '',
                  album: isAlbum(topResult) ? `/albums/${topResult.id}` : '',
                  track: isTrack(topResult) ? `/albums/${topResult.parentId}` : '',
                  playlist: isPlaylist(topResult) ? `/playlists/${topResult.id}` : '',
                  genre: isGenre(topResult) ? `/genres/${topResult.id}` : '',
                }[topResult._type] || '/home'}
              >
                {topResult.title}
              </Link>
            </Typography>
            <Typography
              sx={{
                ...typographyStyle,
                color: 'common.black',
                WebkitLineClamp: 1,
              }}
              variant="subtitle2"
            >
              <Link
                className="link"
                state={linkState}
                style={{
                  pointerEvents: (isPlaylist(topResult) ? 'none' : 'auto'),
                }}
                to={{
                  artist: isArtist(topResult) ? `/artists/${topResult.id}/discography` : '',
                  album: isAlbum(topResult) ? `/artists/${topResult.parentId}` : '',
                  track: isTrack(topResult) ? `/artists/${topResult.grandparentId}` : '',
                }[topResult._type] || '/'}
              >
                {additionalText}
              </Link>
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'relative',
              top: '3px',
              height: '44px',
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              mb: '6px',
            }}
          >
            <TopResultButtons
              topResult={topResult}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TopResult;
