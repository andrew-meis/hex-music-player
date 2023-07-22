import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { isEmpty } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Track } from 'api/index';
import { TrackTable } from 'components/track-table';
import usePlayback from 'hooks/usePlayback';
import { useArtist } from 'queries/artist-queries';
import { useRecentTracks } from 'queries/track-queries';
import { configAtom, libraryAtom } from 'root/Root';
import { AppTrackViewSettings, LocationWithState, RouteParams } from 'types/interfaces';
import Header from './Header';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
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

const RecentFavorites = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation() as LocationWithState;
  const navigationType = useNavigationType();
  const viewSettings = window.electron
    .readConfig('recent-favorites-view-settings') as AppTrackViewSettings;
  const [days, setDays] = useState(90);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { playTracks } = usePlayback();

  const { data: artist, isLoading: artistLoading } = useArtist(+id, library);
  const { data: tracks, isLoading: tracksLoading } = useRecentTracks({
    config,
    library,
    id: +id,
    days,
  });

  const items = useMemo(() => {
    if (!tracks) {
      return [];
    }
    if (filter === '') {
      return tracks;
    }
    return tracks.filter(
      (track) => track.title?.toLowerCase().includes(filter.toLowerCase())
      || track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [filter, tracks]);

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`recent-favorites-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `recent-favorites-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
    sortedItems?: Track[],
  ) => {
    if (sortedItems && !isEmpty(sortedItems)) {
      playTracks(sortedItems, shuffle, key);
      return;
    }
    playTracks(items, shuffle, key);
  }, [items, playTracks]);

  if (artistLoading || tracksLoading) {
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
          `recent-favorites-scroll ${id}`,
          target.scrollTop as unknown as string,
        );
      }}
    >
      <Header
        artist={artist!.artist}
        days={days}
        filter={filter}
        handlePlayNow={handlePlayNow}
        setDays={setDays}
        setFilter={setFilter}
      />
      <TrackTable
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
        viewKey="recent"
      />
    </motion.div>
  );
};

export default RecentFavorites;
