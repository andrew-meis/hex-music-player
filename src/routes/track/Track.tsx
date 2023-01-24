import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useMemo } from 'react';
import { useLocation, useOutletContext, useParams } from 'react-router-dom';
import Palette from 'components/palette/Palette';
import { useConfig, useLibrary, useSettings } from 'queries/app-queries';
import { useLastfmTrack } from 'queries/last-fm-queries';
import { useTrack, useTrackHistory } from 'queries/track-queries';
import { RouteParams } from 'types/interfaces';
import Graphs from './Graphs';
import Header from './Header';
import Info from './Info';
import Similar from './Similar';

const Track = () => {
  const config = useConfig();
  const library = useLibrary();
  const location = useLocation();
  const { data: settings } = useSettings();
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const { data: track } = useTrack({
    library,
    id: +id,
  });
  const { data: trackHistory } = useTrackHistory({
    config: config.data,
    library,
    id: +id,
  });
  const { data: lastfmInfo } = useLastfmTrack({
    apikey: settings?.apiKey,
    artist: track?.grandparentTitle,
    title: track?.title,
  });
  const { data: album } = useQuery(
    ['album-quick', track?.parentId],
    () => library.album(track!.parentId),
    {
      enabled: !!track?.parentId,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      select: (data) => data.albums[0],
    },
  );
  const { width } = useOutletContext() as { width: number };
  const moments = useMemo(
    () => trackHistory.map((obj) => moment.unix(obj.viewedAt)),
    [trackHistory],
  );

  if (!track || !trackHistory || !lastfmInfo || !album) {
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
          >
            <Box
              className="scroll-container"
              height={1}
              sx={{
                overflowX: 'hidden',
                overflowY: 'overlay',
              }}
            >
              <Box maxWidth="900px" mx="auto" pb="48px" width="89%">
                <Header
                  colors={colors}
                  track={track}
                />
                <Info
                  album={album}
                  lastfmTrack={lastfmInfo.track}
                  track={track}
                />
                {track.viewCount > 0 && (
                  <>
                    <Box height={32} width={1} />
                    <Graphs
                      colors={colors}
                      moments={moments}
                    />
                  </>
                )}
                <Box height={48} width={1} />
                <Similar
                  apikey={settings.apiKey}
                  correction={lastfmInfo.correction}
                  width={Math.min(width * 0.89, 900)}
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
