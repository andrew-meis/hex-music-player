import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { isEmpty } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Track } from 'api/index';
import Palette from 'components/palette/Palette';
import usePlayback from 'hooks/usePlayback';
import { useAlbum, useAlbumTracks } from 'queries/album-queries';
import { libraryAtom } from 'root/Root';
import { PlayActions } from 'types/enums';
import { AppTrackViewSettings, RouteParams } from 'types/interfaces';
import Header from './Header';
import Subheader from './Subheader';
import TrackTable from './TrackTable';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    thumb: false,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const Album = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const library = useAtomValue(libraryAtom);
  const album = useAlbum(+id, library);
  const albumTracks = useAlbumTracks(+id, library);
  const location = useLocation();
  const navigationType = useNavigationType();
  const viewSettings = window.electron.readConfig('album-view-settings') as AppTrackViewSettings;
  const [open, setOpen] = useState(false);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { playSwitch } = usePlayback();

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
    sortedItems?: Track[],
  ) => {
    if (sortedItems && !isEmpty(sortedItems)) {
      playSwitch(PlayActions.PLAY_TRACKS, { key, tracks: sortedItems as Track[], shuffle });
      return;
    }
    playSwitch(PlayActions.PLAY_ALBUM, { album: album.data?.album, key, shuffle });
  }, [album.data?.album, playSwitch]);

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

  if (album.isLoading || albumTracks.isLoading || !album.data?.album) {
    return null;
  }

  return (
    <Palette
      id={album.data.album.thumb}
      url={library.api.getAuthenticatedUrl(album.data.album.thumb)}
    >
      {({ data: colors, isLoading, isError }) => {
        if (isLoading || isError) {
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
                `album-scroll ${id}`,
                target.scrollTop as unknown as string,
              );
            }}
          >
            <Header
              album={album.data.album}
              colors={colors}
              handlePlayNow={handlePlayNow}
              library={library}
            />
            <Subheader
              album={album.data.album}
              colors={colors}
              openColumnDialog={() => setOpen(true)}
            />
            <TrackTable
              columnOptions={
                isEmpty(viewSettings.columns)
                  ? defaultViewSettings.columns
                  : viewSettings.columns
              }
              groupBy="parentIndex"
              isViewCompact={
                typeof viewSettings.compact !== 'undefined'
                  ? viewSettings.compact
                  : defaultViewSettings.compact
              }
              library={library}
              multiLineRating={
                typeof viewSettings.multiLineRating !== 'undefined'
                  ? viewSettings.multiLineRating
                  : defaultViewSettings.multiLineRating
              }
              open={open}
              playbackFn={handlePlayNow}
              rows={albumTracks.data || []}
              scrollRef={scrollRef}
              setOpen={setOpen}
              subtextOptions={{
                albumTitle: false,
                artistTitle: true,
                showSubtext: typeof viewSettings.multiLineTitle !== 'undefined'
                  ? viewSettings.multiLineTitle
                  : defaultViewSettings.multiLineTitle,
              }}
            />
          </motion.div>
        );
      }}
    </Palette>
  );
};

export default Album;
