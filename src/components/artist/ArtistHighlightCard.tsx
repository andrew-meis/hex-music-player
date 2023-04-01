import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { IoMdMicrophone } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { Artist } from 'api/index';
import HighlightCardButtons from 'components/buttons/HighlightCardButtons';
import ArtistMenu from 'components/menus/ArtistMenu';
import usePalette, { defaultColors } from 'hooks/usePalette';
import usePlayback from 'hooks/usePlayback';
import { useLibrary, useSettings } from 'queries/app-queries';
import { DragTypes, PlexSortKeys, SortOrders } from 'types/enums';

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

const ArtistHighlightCard = ({ artist }: { artist: Artist }) => {
  const box = useRef<HTMLDivElement>(null);
  const library = useLibrary();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const [menuTarget, setMenuTarget] = useState<Artist[]>([]);
  const { data: settings } = useSettings();
  const { playSwitch } = usePlayback();
  const { colorMode } = settings;

  const thumbSrc = useMemo(() => {
    if (!artist.thumb) return { src: undefined, url: undefined };
    const url = library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: artist.thumb,
        width: 300,
        height: 300,
        minSize: 1,
        upscale: 1,
      },
    );
    return { src: artist.thumb, url };
  }, [library, artist]);

  const { data: palette, isError } = usePalette(thumbSrc.src || '', thumbSrc.url || '');

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setMenuTarget([artist]);
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [artist, toggleMenu]);

  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.ARTIST,
    item: [artist],
  }), [artist]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, artist]);

  const additionalText = useMemo(() => (
    artist.childCount > 1
      ? `${artist.childCount} releases`
      : `${artist.childCount} release`
  ), [artist]);

  const linkState = useMemo(() => ({
    guid: artist.guid,
    title: artist.title,
    sort: [
      PlexSortKeys.RELEASE_DATE,
      SortOrders.DESC,
    ].join(''),
  }), [artist]);

  const fontSize = useMemo(() => {
    switch (true) {
      case artist.title.length > 55:
        return '1.4rem';
      case artist.title.length > 35:
        return '1.6rem';
      case artist.title.length > 15:
        return '1.8rem';
      case artist.title.length <= 15:
        return '2.0rem';
      default: return '2.0rem';
    }
  }, [artist.title.length]);

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
      onContextMenu={handleContextMenu}
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
          alt={artist.title}
          src={thumbSrc.url}
          sx={{
            borderRadius: '50%',
            height: 295 - 71 - 12,
            mb: '6px',
            ml: '6px',
            width: 295 - 71 - 12,
          }}
          variant="rounded"
        >
          <SvgIcon className="generic-icon" sx={{ color: 'common.black' }}>
            <IoMdMicrophone />
          </SvgIcon>
        </Avatar>
        <Typography fontSize="0.75rem" letterSpacing="0.5px" sx={textStyle}>artist</Typography>
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
                state={linkState}
                to={`/artists/${artist.id}`}
              >
                {artist.title}
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
                to={`/artists/${artist.id}/discography`}
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
            <HighlightCardButtons
              item={artist}
            />
          </Box>
        </Box>
      </Box>
      <ArtistMenu
        anchorPoint={anchorPoint}
        artists={menuTarget}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        onClose={() => {
          toggleMenu(false);
          setMenuTarget([]);
        }}
        {...menuProps}
      />
    </Box>
  );
};

export default ArtistHighlightCard;
