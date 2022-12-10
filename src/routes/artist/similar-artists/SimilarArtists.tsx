import { Box } from '@mui/material';
import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Album, Artist, Hub, Library, PlayQueueItem, Track } from 'hex-plex';
import { throttle } from 'lodash';
import React, { useMemo, useRef, useState } from 'react';
import {
  Location,
  NavigateFunction,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useArtist, useArtistTracks } from 'queries/artist-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { PlayActions } from 'types/enums';
import ArtistsRow from './ArtistsRow';
import GroupRow from './GroupRow';
import Header from './Header';
import type { RouteParams } from 'types/interfaces';

const Footer = () => (
  <Box
    height="16px"
    maxWidth={900}
    mx="auto"
    width="89%"
  />
);

const getCols = (width: number) => {
  if (width >= 1350) {
    return 6;
  }
  if (width < 1350 && width >= 1100) {
    return 5;
  }
  if (width < 1100 && width >= 850) {
    return 4;
  }
  if (width < 850 && width >= 650) {
    return 3;
  }
  if (width < 650) {
    return 2;
  }
  return 4;
};

interface LocationWithState extends Location {
  state: { guid: Artist['guid'], title: Artist['title'] }
}

export interface OpenArtist {
  id: number;
  guid: string;
  title: string;
}

export interface SimilarArtistGroup {
  _type: string;
  identifier: string;
  text: string;
}

export interface SimilarArtistRow {
  _type: string;
  artists: Artist[];
  grid: { cols: number };
  section: string;
}

export interface SimilarArtistItems {
  rows?: SimilarArtistRow[];
  groups?: SimilarArtistGroup[];
  groupCounts?: number[];
}

export interface SimilarArtistContext {
  artist: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  getFormattedTime: (inMs: number) => string;
  grid: { cols: number };
  height: number;
  isPlaying: boolean;
  items: SimilarArtistItems;
  library: Library;
  navigate: NavigateFunction;
  nowPlaying: PlayQueueItem | undefined;
  openArtist: OpenArtist;
  openArtistQuery: UseQueryResult<{albums: Album[], artist: Artist, hubs: Hub[]}>,
  openArtistTracksQuery: UseQueryResult<Track[]>;
  openCard: {row: number, index: number};
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  setOpenArtist: React.Dispatch<React.SetStateAction<OpenArtist>>;
  setOpenCard: React.Dispatch<React.SetStateAction<{row: number, index: number}>>;
  thumbSrc: string;
  virtuoso: React.RefObject<GroupedVirtuosoHandle>;
  width: number;
}

export interface RowProps {
  index: number;
  context: SimilarArtistContext;
}

const ArtistsRowContent = (props: RowProps) => <ArtistsRow {...props} />;
const GroupRowContent = (props: RowProps) => <GroupRow {...props} />;

const SimilarArtists = () => {
  const config = useConfig();
  const library = useLibrary();
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const artist = useArtist(+id, library);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const topMostGroup = useRef<SimilarArtistGroup | null>(null);
  const virtuoso = useRef<GroupedVirtuosoHandle>(null);
  const [openArtist, setOpenArtist] = useState<OpenArtist>({ id: -1, title: '', guid: '' });
  const [openCard, setOpenCard] = useState({ row: -1, index: -1 });
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playSwitch } = usePlayback();
  const { width, height } = useOutletContext() as { width: number, height: number };

  const openArtistQuery = useArtist(openArtist.id, library);
  const openArtistTracksQuery = useArtistTracks({
    config: config.data,
    library,
    id: openArtist.id,
    title: openArtist.title,
    guid: openArtist.guid,
    slice: 5,
  });

  const thumbSrc = library.api
    .getAuthenticatedUrl(
      '/photo/:/transcode',
      { url: artist.data?.artist.thumb || 'null', width: 100, height: 100 },
    );

  // create array for virtualization
  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const items = useMemo(() => {
    if (!artist.data) {
      return {};
    }
    const rows: SimilarArtistRow[] = [];
    const groups: SimilarArtistGroup[] = [];
    const groupCounts: number[] = [];
    const similar = artist.data?.hubs.find((hub) => hub.hubIdentifier === 'artist.similar');
    let sonicSimilar = artist.data?.hubs
      .find((hub) => hub.hubIdentifier === 'external.artist.similar.sonically');
    const sonicFiltered = sonicSimilar?.items
      .filter((sonicArtist) => similar?.items
        .every((similarArtist) => similarArtist.id !== sonicArtist.id));
    if (similar && similar.items.length > 0 && sonicSimilar && sonicFiltered) {
      sonicSimilar = { ...sonicSimilar, items: sonicFiltered || [] };
    }
    if (similar && similar.size > 0) {
      let count = 0;
      const identifier = similar.hubIdentifier;
      groups.push({ _type: 'subheaderText', identifier, text: similar.title });
      for (let i = 0; i < similar.items.length; i += grid.cols) {
        const row = similar.items.slice(i, i + grid.cols) as Artist[];
        rows.push({
          _type: 'artists', artists: row, grid, section: similar.title,
        });
        count += 1;
      }
      groupCounts.push(count);
    }
    if (sonicSimilar && sonicSimilar.size > 0) {
      let count = 0;
      const identifier = sonicSimilar.hubIdentifier;
      groups.push({ _type: 'subheaderText', identifier, text: sonicSimilar.title });
      for (let i = 0; i < sonicSimilar.items.length; i += grid.cols) {
        const row = sonicSimilar.items.slice(i, i + grid.cols) as Artist[];
        rows.push({
          _type: 'artists', artists: row, grid, section: sonicSimilar.title,
        });
        count += 1;
      }
      groupCounts.push(count);
    }
    return { rows, groups, groupCounts };
  }, [artist.data, grid]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const similarArtistContext = useMemo(() => ({
    artist: artist.data,
    getFormattedTime,
    grid,
    height,
    isPlaying,
    items,
    library,
    navigate,
    nowPlaying,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    playSwitch,
    setOpenArtist,
    setOpenCard,
    thumbSrc,
    virtuoso,
    width,
  }), [
    artist.data,
    getFormattedTime,
    grid,
    height,
    isPlaying,
    items,
    library,
    navigate,
    nowPlaying,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    playSwitch,
    setOpenArtist,
    setOpenCard,
    thumbSrc,
    virtuoso,
    width,
  ]);

  if (!artist.data) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
    >
      <GroupedVirtuoso
        className="scroll-container"
        components={{
          Footer,
          Header,
        }}
        context={similarArtistContext}
        groupContent={(index) => GroupRowContent(
          { index, context: similarArtistContext },
        )}
        groupCounts={items.groupCounts}
        isScrolling={handleScrollState}
        itemContent={
          (index, groupIndex, item, context) => ArtistsRowContent({ index, context })
        }
        itemsRendered={(list) => {
          // @ts-ignore
          const renderedGroupIndices = (list).map((listEl) => listEl.groupIndex);
          if (topMostGroup.current !== items.groups![renderedGroupIndices[0]]) {
            queryClient
              .setQueryData(['similar-header-text'], items.groups![renderedGroupIndices[0]]?.text);
            topMostGroup.current = items.groups![renderedGroupIndices[0]];
          }
        }}
        ref={virtuoso}
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
      />
    </motion.div>
  );
};

export default SimilarArtists;
