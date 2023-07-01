/* eslint-disable no-underscore-dangle */
import { Avatar, Box, ListItem, SvgIcon, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { FaTags } from 'react-icons/fa';
import { IoMdMicrophone } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from 'queries/app-queries';
import { DragTypes, SortOrders, TrackSortKeys } from 'types/enums';
import { isAlbum, isArtist, isGenre, isPlaylist, isTrack } from 'types/type-guards';
import { Result } from 'types/types';
import styles from './Search.module.scss';
import ResultTooltip from './tooltip/ResultTooltip';

const resultStyle = {
  display: 'flex',
  alignItems: 'center',
  height: '56px',
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

interface ResultRowProps {
  result: Result;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResultRow = ({
  result, setOpen,
}: ResultRowProps) => {
  const library = useLibrary();
  const navigate = useNavigate();
  const [isHovered, setHovered] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const thumbSrc = useMemo(() => {
    if (isGenre(result)) return undefined;
    if (isPlaylist(result) && (result.thumb || result.composite)) {
      return library.api.getAuthenticatedUrl(
        '/photo/:/transcode',
        {
          url: result.thumb || result.composite,
          width: 100,
          height: 100,
          minSize: 1,
          upscale: 1,
        },
      );
    }
    if (!result.thumb) return undefined;
    return library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: result.thumb,
        width: 100,
        height: 100,
        minSize: 1,
        upscale: 1,
      },
    );
  }, [library, result]);

  const [, drag, dragPreview] = useDrag(() => ({
    type: getDragType(result._type),
    item: [result],
  }), [result]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, result]);

  useEffect(() => {
    setHovered(tooltipOpen);
  }, [tooltipOpen]);

  const handleNavigate = useCallback((
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    setOpen(false);
  }, [setOpen]);

  const additionalText = useMemo(() => {
    if (isArtist(result)) {
      return (
        <>
          {result._type}
          &nbsp;
          ·
          &nbsp;
          <Link
            className="link"
            state={{
              guid: result.guid,
              title: result.title,
              sort: [TrackSortKeys.RELEASE_DATE, SortOrders.DESC],
            }}
            to={`/artists/${result.id}/discography`}
            onClick={(event) => handleNavigate(event)}
          >
            {result.childCount > 1
              ? `${result.childCount} releases`
              : `${result.childCount} release`}
          </Link>
        </>
      );
    }
    if (isAlbum(result)) {
      return (
        <>
          {result._type}
          &nbsp;
          ·
          &nbsp;
          <Link
            className="link"
            state={{ guid: result.parentGuid, title: result.parentTitle }}
            to={`/artists/${result.parentId}`}
            onClick={(event) => handleNavigate(event)}
          >
            { result.parentTitle }
          </Link>
        </>
      );
    }
    if (isTrack(result)) {
      return (
        <>
          {result._type}
          &nbsp;
          ·
          &nbsp;
          <Link
            className="link"
            state={{ guid: result.parentGuid, title: result.parentTitle }}
            to={`/artists/${result.grandparentId}`}
            onClick={(event) => handleNavigate(event)}
          >
            { result.originalTitle ? result.originalTitle : result.grandparentTitle }
          </Link>
          &nbsp;
          —
          &nbsp;
          <Link
            className="link"
            to={`/albums/${result.parentId}`}
            onClick={(event) => handleNavigate(event)}
          >
            { result.parentTitle }
          </Link>
        </>
      );
    }
    if (isGenre(result)) {
      return (
        <>
          {result._type}
        </>
      );
    }
    if (isPlaylist(result)) {
      const { leafCount } = result;
      return (
        <>
          {result._type}
          &nbsp;
          ·
          &nbsp;
          {leafCount}
          &nbsp;
          {leafCount > 1 || leafCount === 0 ? 'tracks' : 'track'}
        </>
      );
    }
    return '';
  }, [handleNavigate, result]);

  const handleClick = () => {
    if (isArtist(result)) {
      const state = { guid: result.guid, title: result.title };
      navigate(`/artists/${result.id}`, { state });
      setOpen(false);
      return;
    }
    if (isAlbum(result)) {
      navigate(`/albums/${result.id}`);
      setOpen(false);
      return;
    }
    if (isTrack(result)) {
      navigate(`/albums/${result.parentId}`);
      setOpen(false);
      return;
    }
    if (isPlaylist(result)) {
      navigate(`/playlists/${result.id}`);
      setOpen(false);
      return;
    }
    if (isGenre(result)) {
      const state = { title: result.title };
      navigate(`/genres/${result.id}`, { state });
      setOpen(false);
      return;
    }
    setOpen(false);
  };

  return (
    <ListItem
      disablePadding
      className={isHovered ? styles['results-list-hover'] : styles['results-list']}
      ref={(isGenre(result) || isPlaylist(result)) ? null : drag}
      sx={resultStyle}
      onClick={handleClick}
      onDragStart={(e) => {
        if (isGenre(result)) e.preventDefault();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Avatar
        alt={result.title}
        src={thumbSrc}
        sx={{ marginLeft: '8px', marginRight: '8px' }}
        variant={result.type !== 'artist' ? 'rounded' : 'circular'}
      >
        <SvgIcon>
          {isGenre(result) ? <FaTags /> : null}
          {isArtist(result) ? <IoMdMicrophone /> : null}
        </SvgIcon>
      </Avatar>
      <Box
        display="flex"
        flexDirection="column"
        width={1}
      >
        <Box
          sx={{
            WebkitLineClamp: 1,
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
          }}
        >
          <Typography
            lineHeight="21px"
          >
            {result.title}
          </Typography>
        </Box>
        <Box
          sx={{
            WebkitLineClamp: 1,
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
          }}
        >
          <Typography
            fontSize="0.875rem"
          >
            {additionalText}
          </Typography>
        </Box>
      </Box>
      <ResultTooltip
        color="text.primary"
        result={result}
        setOpen={setOpen}
        setTooltipOpen={setTooltipOpen}
        tooltipOpen={tooltipOpen}
      />
    </ListItem>
  );
};

export default ResultRow;
