import { Box, SvgIcon } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { BsMusicNoteList } from 'react-icons/bs';
import { NavigateFunction } from 'react-router-dom';
import {
  Album, Artist, Library, PlayQueueItem, Playlist, PlaylistItem, Track,
} from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import { useAddToPlaylist } from 'hooks/playlistHooks';
import usePlayback from 'hooks/usePlayback';
import { usePlaylist } from 'queries/playlist-queries';
import styles from 'styles/MotionImage.module.scss';
import { DragTypes } from 'types/enums';
import { CardMeasurements } from 'types/interfaces';

interface PlaylistCardProps {
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  id: number;
  library: Library;
  menuTarget: Playlist[];
  measurements: CardMeasurements;
  navigate: NavigateFunction;
}

const PlaylistCard = ({
  handleContextMenu,
  id,
  library,
  measurements,
  menuTarget,
  navigate,
}: PlaylistCardProps) => {
  const addToPlaylist = useAddToPlaylist();
  const [hover, setHover] = useState(false);
  const { playPlaylist } = usePlayback();
  const { data: playlist, isLoading } = usePlaylist(id, library);

  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id).includes(id);
  const thumbSrc = useMemo(() => {
    if (!playlist || (!playlist.thumb && !playlist.composite)) return undefined;
    return library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: playlist.thumb || playlist.composite,
        width: 300,
        height: 300,
        minSize: 1,
        upscale: 1,
      },
    );
  }, [library, playlist]);

  const handleDrop = useCallback(async (
    array: any[],
    itemType: null | string | symbol,
  ) => {
    if (!playlist) return;
    if (
      itemType === DragTypes.PLAYLIST_ITEM
      || itemType === DragTypes.PLAYQUEUE_ITEM
      || itemType === DragTypes.SMART_PLAYLIST_ITEM
    ) {
      await addToPlaylist(playlist.id, array.map((item) => item.track.id));
      return;
    }
    await addToPlaylist(playlist.id, array.map((item) => item.id));
  }, [addToPlaylist, playlist]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      DragTypes.ALBUM,
      DragTypes.ARTIST,
      DragTypes.PLAYLIST_ITEM,
      DragTypes.PLAYQUEUE_ITEM,
      DragTypes.TRACK,
      DragTypes.SMART_PLAYLIST_ITEM,
    ],
    drop: (
      item: Album[] | Artist[] | PlaylistItem[] | PlayQueueItem[] | Track[],
      monitor,
    ) => handleDrop(item, monitor.getItemType()),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [playlist]);

  const handlePlay = () => playPlaylist(playlist!);
  const handleShuffle = () => playPlaylist(playlist!, true);

  return (
    <MotionBox
      className={styles.container}
      data-id={id}
      height={measurements.ROW_HEIGHT}
      key={id}
      ref={!playlist?.smart ? drop : null}
      sx={{
        backgroundColor: menuOpen ? 'var(--mui-palette-action-selected)' : '',
        border: isOver ? '1px solid var(--mui-palette-primary-main)' : '1px solid transparent',
        borderRadius: '32px',
        contain: 'paint',
        '&:hover': {
          backgroundColor: menuOpen ? 'var(--mui-palette-action-selected)' : '',
        },
      }}
      whileHover="hover"
      width={measurements.IMAGE_SIZE}
      onClick={() => navigate(`/playlists/${id}`)}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isLoading && !!playlist && (
        <MotionBox
          animate={{ opacity: 1 }}
          display="flex"
          initial={{ opacity: 0 }}
        >
          <MotionBox
            bgcolor="action.selected"
            className={styles.image}
            flexDirection="column-reverse"
            flexShrink={0}
            height={measurements.ROW_HEIGHT - 24}
            margin="12px"
            style={{
              borderRadius: '32px',
              transition: '0.2s',
              '--img': `url(${thumbSrc})`,
            } as React.CSSProperties}
            variants={menuOpen ? {} : imageMotion}
            width={measurements.ROW_HEIGHT - 24}
          >
            {!thumbSrc && (
              <SvgIcon
                className="generic-icon"
                sx={{ color: 'common.grey' }}
              >
                <BsMusicNoteList />
              </SvgIcon>
            )}
          </MotionBox>
          <Box
            alignItems="flex-start"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Title marginX="12px" textAlign="center">
              {playlist.title}
            </Title>
            <Subtitle
              marginX="12px"
              textAlign="center"
            >
              {`${playlist.leafCount} ${playlist.leafCount === 1 ? 'track' : 'tracks'}`}
            </Subtitle>
            {hover && (
              <MotionBox
                animate={{ opacity: 1, y: 0 }}
                bottom={6}
                initial={{ opacity: 0, y: 10 }}
                position="absolute"
                right={6}
              >
                <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
              </MotionBox>
            )}
          </Box>
        </MotionBox>
      )}
    </MotionBox>
  );
};

export default PlaylistCard;
