import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import moment from 'moment';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigationType, useOutletContext, useParams } from 'react-router-dom';
import Palette from 'components/palette/Palette';
import { VIEW_PADDING, WIDTH_CALC } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { useAlbumQuick } from 'queries/album-queries';
import { useLastfmSearch, useLastfmTrack } from 'queries/last-fm-queries';
import { useTrack, useTrackHistory } from 'queries/track-queries';
import { configAtom, libraryAtom, settingsAtom } from 'root/Root';
import { RouteParams } from 'types/interfaces';
import Graphs from './Graphs';
import Header from './Header';
import Info from './Info';
import Similar from './Similar';

const Track = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const box = useRef<HTMLDivElement>(null);
  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation();
  const navigationType = useNavigationType();
  const settings = useAtomValue(settingsAtom);

  const { data: track } = useTrack({
    library,
    id: +id,
  });
  const { data: trackHistory } = useTrackHistory({
    config,
    library,
    id: +id,
  });
  const { data: lastfmSearch } = useLastfmSearch({
    apikey: settings?.apiKey,
    artist: track?.grandparentTitle,
    title: track?.title,
  });
  const { data: lastfmTrack } = useLastfmTrack({
    apikey: settings?.apiKey,
    artist: lastfmSearch?.artist,
    title: lastfmSearch?.name,
  });
  const { data: album } = useAlbumQuick(library, track?.parentId);
  const { playSwitch } = usePlayback();
  const { width } = useOutletContext() as { width: number };
  const moments = useMemo(
    () => trackHistory
      .map((obj) => moment.unix(obj.viewedAt)),
    // trackHistory.filter((date) => date.format('YYYY') === '2017')
    [trackHistory],
  );

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`track-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `track-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  if (!track || !trackHistory || !lastfmTrack || !album) {
    return null;
  }

  return (
    <Palette
      id={track.parentThumb}
      url={library.api.getAuthenticatedUrl(track.parentThumb)}
    >
      {({ data: colors, isLoading, isError }) => {
        if (isLoading || isError) {
          return null;
        }
        return (
          <motion.div
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={location.pathname}
            style={{ height: '100%' }}
            onAnimationComplete={() => box.current
              ?.scrollTo({ top: initialScrollTop })}
          >
            <Box
              className="scroll-container"
              height={1}
              ref={box}
              sx={{
                overflowX: 'hidden',
                overflowY: 'overlay',
              }}
              onScroll={(e) => {
                const target = e.currentTarget as unknown as HTMLDivElement;
                sessionStorage.setItem(
                  `track-scroll ${id}`,
                  target.scrollTop as unknown as string,
                );
              }}
            >
              <Box maxWidth="900px" mx="auto" pb="48px" width={WIDTH_CALC}>
                <Header
                  album={album}
                  colors={colors}
                  library={library}
                  playSwitch={playSwitch}
                  track={track}
                />
                <Info
                  album={album}
                  lastfmTrack={lastfmTrack}
                  track={track}
                />
                {track.viewCount > 0 && (
                  <>
                    <Box height={24} width={1} />
                    <Graphs
                      colors={colors}
                      moments={moments}
                    />
                  </>
                )}
                <Box height={48} width={1} />
                <Similar
                  apikey={settings.apiKey}
                  artist={lastfmSearch?.artist}
                  library={library}
                  playSwitch={playSwitch}
                  title={lastfmSearch?.name}
                  width={Math.min(width - VIEW_PADDING, 900)}
                />
              </Box>
            </Box>
          </motion.div>
        );
      }}
    </Palette>
  );
};

export default Track;
