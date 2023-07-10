import { motion } from 'framer-motion';
import { isEmpty } from 'lodash';
import { useMemo, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import Palette from 'components/palette/Palette';
import TrackTable from 'components/track/TrackTable';
import { useAlbum, useAlbumTracks } from 'queries/album-queries';
import { useLibrary } from 'queries/app-queries';
import { AppPageViewSettings, RouteParams } from 'types/interfaces';
import Header from './Header';

const defaultViewSettings: AppPageViewSettings = {
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
  const viewSettings = window.electron.readConfig('album-view-settings') as AppPageViewSettings;
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const library = useLibrary();
  const album = useAlbum(+id, library);
  const albumTracks = useAlbumTracks(+id, library);
  const location = useLocation();
  const navigationType = useNavigationType();
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);

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
              library={library}
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
              scrollRef={scrollRef}
              subtextOptions={{
                albumTitle: false,
                artistTitle: false,
                showSubtext: typeof viewSettings.multiLineTitle !== 'undefined'
                  ? viewSettings.multiLineTitle
                  : defaultViewSettings.multiLineTitle,
              }}
              tracks={albumTracks.data || []}
            />
          </motion.div>
        );
      }}
    </Palette>
  );
};

export default Album;
