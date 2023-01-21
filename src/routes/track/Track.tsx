import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'react-router-dom';
import Palette from 'components/palette/Palette';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useTrack, useTrackHistory } from 'queries/track-queries';
import { RouteParams } from 'types/interfaces';
import Header from './Header';
import MonthGraph from './MonthGraph';
import WeekGraph from './WeekGraph';
import YearGraph from './YearGraph';

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

  if (!track || !trackHistory) {
    return null;
  }

  return (
    <Palette
      src={track.parentThumb}
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
              <Typography
                color="text.primary"
                fontFamily="TT Commons"
                fontSize="1.625rem"
              >
                Playback Statistics
              </Typography>
              <YearGraph
                colors={colors}
                trackHistory={trackHistory}
              />
              <Box mt="32px" />
              <MonthGraph
                colors={colors}
                trackHistory={trackHistory}
              />
              <Box mt="32px" />
              <WeekGraph
                colors={colors}
                trackHistory={trackHistory}
              />
            </Box>
          </motion.div>
        );
      }}
    </Palette>
  );
};

export default Track;
