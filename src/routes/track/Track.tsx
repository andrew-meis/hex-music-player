import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import moment from 'moment';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Palette from 'components/palette/Palette';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useTrack, useTrackHistory } from 'queries/track-queries';
import { RouteParams } from 'types/interfaces';
import Graphs from './Graphs';
import Header from './Header';

const Track = () => {
  const config = useConfig();
  const library = useLibrary();
  const location = useLocation();
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
  const moments = useMemo(
    () => trackHistory.map((obj) => moment.unix(obj.viewedAt)),
    [trackHistory],
  );

  if (!track || !trackHistory) {
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
            <Box maxWidth="900px" mx="auto" width="89%">
              <Header
                colors={colors}
                track={track}
              />
              <Graphs
                colors={colors}
                moments={moments}
              />
            </Box>
          </motion.div>
        );
      }}
    </Palette>
  );
};

export default Track;
