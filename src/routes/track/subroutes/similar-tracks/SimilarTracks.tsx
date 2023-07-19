import { Typography } from '@mui/material';
import { CellContext } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Track } from 'api/index';
import { TrackTable } from 'components/track-table';
import usePlayback from 'hooks/usePlayback';
import { useLibrary } from 'queries/app-queries';
import { useSimilarTracks, useTrack } from 'queries/track-queries';
import { AppTrackViewSettings, LocationWithState, RouteParams } from 'types/interfaces';
import Header from './Header';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    distance: true,
    grandparentTitle: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    thumb: true,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const SimilarTracks = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const library = useLibrary();
  const location = useLocation() as LocationWithState;
  const navigationType = useNavigationType();
  const viewSettings = window.electron
    .readConfig('similar-tracks-view-settings') as AppTrackViewSettings;
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { playTracks } = usePlayback();

  const { data: currentTrack, isLoading: trackLoading } = useTrack({ id: +id, library });
  const { data: tracks, isLoading: tracksLoading } = useSimilarTracks({
    library,
    track: currentTrack,
  });

  const additionalColumns = [{
    id: 'distance',
    accessorFn: (track: Track) => track.distance,
    cell: (info: CellContext<Track, number>) => ((1 - info.getValue())
      .toLocaleString('en', { style: 'percent' })),
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Score
      </Typography>
    ),
  }];

  const items = useMemo(() => {
    if (!tracks) {
      return [];
    }
    if (filter !== '') {
      return tracks.filter(
        (track) => track.title?.toLowerCase().includes(filter.toLowerCase())
        || track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
        || track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
        || track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
      );
    }
    return tracks;
  }, [filter, tracks]);

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`similar-tracks-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `similar-tracks-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
    sortedItems?: Track[],
  ) => {
    if (!sortedItems) {
      playTracks(items, shuffle, key);
      return;
    }
    playTracks(sortedItems, shuffle, key);
  }, [items, playTracks]);

  if (trackLoading || tracksLoading) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scroll-container"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      ref={setScrollRef}
      style={{ height: '100%', overflow: 'overlay' }}
      onAnimationComplete={() => scrollRef?.scrollTo({ top: initialScrollTop })}
      onScroll={(e) => {
        const target = e.currentTarget as unknown as HTMLDivElement;
        sessionStorage.setItem(
          `similar-tracks-scroll ${id}`,
          target.scrollTop as unknown as string,
        );
      }}
    >
      <Header
        filter={filter}
        handlePlayNow={handlePlayNow}
        setFilter={setFilter}
        track={currentTrack!}
      />
      <TrackTable
        additionalColumns={additionalColumns}
        columnOptions={
          typeof viewSettings !== 'undefined'
            ? viewSettings.columns
            : defaultViewSettings.columns
        }
        isViewCompact={
          typeof viewSettings !== 'undefined'
            ? viewSettings.compact
            : defaultViewSettings.compact
        }
        library={library}
        multiLineRating={
          typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineRating
            : defaultViewSettings.multiLineRating
        }
        open={open}
        playbackFn={handlePlayNow}
        rows={items || []}
        scrollRef={scrollRef}
        setOpen={setOpen}
        subtextOptions={{
          albumTitle: true,
          artistTitle: true,
          showSubtext: typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineTitle
            : defaultViewSettings.multiLineTitle,
        }}
        viewKey="similar"
      />
    </motion.div>
  );
};

export default SimilarTracks;
