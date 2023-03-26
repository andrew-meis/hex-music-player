/* eslint-disable no-underscore-dangle */
import { Avatar, Box, ListItem, SvgIcon } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { FaTags, IoMdMicrophone } from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from 'queries/app-queries';
import { DragTypes, PlexSortKeys, SortOrders } from 'types/enums';
import { isAlbum, isArtist, isGenre, isPlaylist, isTrack } from 'types/type-guards';
import styles from '../Search.module.scss';
import ResultTooltip from '../tooltip/ResultTooltip';
import type { Result } from 'types/types';

const resultStyle = {
  display: 'flex',
  alignItems: 'center',
  height: '64px',
};

const linkBoxStyle = {
  display: 'table-cell',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
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
    event: React.MouseEvent<HTMLDivElement>,
    path: string,
    state?: { guid: string, title: string, sort?: string },
  ) => {
    event.stopPropagation();
    navigate(path, { state });
    setOpen(false);
  }, [navigate, setOpen]);

  const additionalText = useMemo(() => {
    if (isArtist(result)) {
      return (
        <Box display="flex">
          {result._type}
          &nbsp;
          ·
          &nbsp;
          <Box
            className="link"
            sx={linkBoxStyle}
            onClick={(event) => handleNavigate(
              event,
              `/artists/${result.id}/discography`,
              {
                guid: result.guid,
                title: result.title,
                sort: [
                  PlexSortKeys.RELEASE_DATE,
                  SortOrders.DESC,
                ].join(''),
              },
            )}
          >
            {result.childCount > 1
              ? `${result.childCount} releases`
              : `${result.childCount} release`}
          </Box>
        </Box>
      );
    }
    if (isAlbum(result)) {
      return (
        <Box display="flex">
          {result._type}
          &nbsp;
          ·
          &nbsp;
          <Box
            className="link"
            sx={linkBoxStyle}
            onClick={(event) => handleNavigate(
              event,
              `/artists/${result.parentId}`,
              { guid: result.parentGuid, title: result.parentTitle },
            )}
          >
            { result.parentTitle }
          </Box>
        </Box>
      );
    }
    if (isTrack(result)) {
      return (
        <Box display="flex">
          {result._type}
          &nbsp;
          ·
          &nbsp;
          <Box
            className="link"
            sx={{ ...linkBoxStyle, flexShrink: 0 }}
            onClick={(event) => handleNavigate(
              event,
              `/artists/${result.grandparentId}`,
              { guid: result.parentGuid, title: result.parentTitle },
            )}
          >
            { result.originalTitle ? result.originalTitle : result.grandparentTitle }
          </Box>
          <>
            &nbsp;
            —
            &nbsp;
            <Box
              className="link"
              sx={linkBoxStyle}
              onClick={(event) => handleNavigate(event, `/albums/${result.parentId}`)}
            >
              { result.parentTitle }
            </Box>
          </>
        </Box>
      );
    }
    if (isGenre(result)) {
      return (
        <Box display="flex">
          {result._type}
        </Box>
      );
    }
    if (isPlaylist(result)) {
      const { leafCount } = result;
      return (
        <Box display="flex">
          {result._type}
          &nbsp;
          ·
          &nbsp;
          {leafCount}
          &nbsp;
          {leafCount > 1 || leafCount === 0 ? 'tracks' : 'track'}
        </Box>
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
      ref={drag}
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
        sx={{ height: '52px', marginLeft: '8px', marginRight: '8px', width: '52px' }}
        variant={result.type !== 'artist' ? 'rounded' : 'circular'}
      >
        <SvgIcon>
          {isGenre(result) ? <FaTags /> : null}
          {isArtist(result) ? <IoMdMicrophone /> : null}
        </SvgIcon>
      </Avatar>
      <Box
        sx={{
          display: 'table',
          tableLayout: 'fixed',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'table-cell',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontFamily: 'Rubik, sans-serif' }}>
            {result.title}
          </span>
          <br />
          <span style={{ fontSize: '0.875rem' }}>
            {additionalText}
          </span>
        </Box>
      </Box>
      {!isPlaylist(result) && !isGenre(result) && (
        <ResultTooltip
          color="text.primary"
          result={result}
          setOpen={setOpen}
          setTooltipOpen={setTooltipOpen}
          tooltipOpen={tooltipOpen}
        />
      )}
    </ListItem>
  );
};

export default ResultRow;
