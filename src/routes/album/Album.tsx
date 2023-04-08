import { Box } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { countBy } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  NavigateFunction,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from 'react-router-dom';
import { GroupedVirtuoso } from 'react-virtuoso';
import {
  Artist,
  Album as AlbumType,
  Playlist,
  Track,
  Genre,
  Library,
  PlayQueueItem,
} from 'api/index';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useAlbum, useAlbumTracks } from 'queries/album-queries';
import { useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { RouteParams } from 'types/interfaces';
import AnimatedHeader from './AnimatedHeader';
import Footer from './Footer';
import GroupRow from './GroupRow';
import List from './List';
import Row from './Row';

export interface AlbumContext {
  album: {
      album: AlbumType;
      related: (AlbumType | Playlist | Track | Artist | Genre)[];
  } | undefined;
  getFormattedTime: (inMs: number) => string;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  library: Library;
  navigate: NavigateFunction;
  nowPlaying: PlayQueueItem | undefined;
  playAlbumAtTrack: (track: Track, shuffle?: boolean) => Promise<void>;
  tracks: Track[];
}

export interface GroupRowProps {
  context: AlbumContext;
  discNumber: number;
}

export interface RowProps {
  context: AlbumContext;
  index: number;
  track: Track;
}

const GroupRowContent = (props: GroupRowProps) => <GroupRow {...props} />;
const RowContent = (props: RowProps) => <Row {...props} />;

const Album = () => {
  const library = useLibrary();
  // data loading
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const album = useAlbum(+id, library);
  const albumTracks = useAlbumTracks(+id, library);
  const counts = countBy(albumTracks.data, 'parentIndex');
  const groupCounts = Object.values(counts);
  const groups = Object.keys(counts).map((i) => +i);
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const queryClient = useQueryClient();
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [shrink, setShrink] = useState(false);
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playAlbumAtTrack } = usePlayback();

  useEffect(() => {
    queryClient.setQueryData(['selected-rows'], []);
  }, [id, queryClient]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`album-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `album-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const albumContext: AlbumContext = useMemo(() => ({
    album: album.data,
    getFormattedTime,
    hoverIndex,
    isPlaying,
    library,
    navigate,
    nowPlaying,
    playAlbumAtTrack,
    tracks: albumTracks.data || [],
  }), [
    album.data,
    albumTracks.data,
    getFormattedTime,
    hoverIndex,
    isPlaying,
    library,
    navigate,
    nowPlaying,
    playAlbumAtTrack,
  ]);

  if (album.isLoading || albumTracks.isLoading || !album.data?.album) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scroll-container"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      ref={setScroller}
      style={{
        height: '100%',
        overflowY: 'overlay',
      } as unknown as React.CSSProperties}
      onAnimationComplete={() => scroller?.scrollTo({ top: initialScrollTop })}
      onScroll={(e) => {
        const target = e.currentTarget as unknown as HTMLDivElement;
        sessionStorage.setItem(
          `album-scroll ${id}`,
          target.scrollTop as unknown as string,
        );
        if (target.scrollTop > 199) {
          setShrink(true);
        }
        if (target.scrollTop < 200) {
          setShrink(false);
        }
      }}
    >
      <Box
        height={1}
        left={0}
        marginRight="-100%"
        position="sticky"
        sx={{
          float: 'left',
          pointerEvents: 'none',
        }}
        top={0}
        width={1}
        zIndex={2}
      >
        <AnimatedHeader
          album={album.data.album}
          navigate={navigate}
          shrink={shrink}
        />
      </Box>
      <GroupedVirtuoso
        useWindowScroll
        components={{
          Footer,
          List,
        }}
        context={albumContext}
        customScrollParent={scroller || undefined}
        fixedItemHeight={56}
        groupContent={(index) => GroupRowContent(
          { context: albumContext, discNumber: groups[index] },
        )}
        groupCounts={groupCounts}
        isScrolling={handleScrollState}
        itemContent={(index, _groupIndex, _item, context) => RowContent(
          { context, index, track: albumTracks.data![index] },
        )}
        style={{
          marginTop: 300,
        }}
      />
    </motion.div>
  );
};

export default Album;
