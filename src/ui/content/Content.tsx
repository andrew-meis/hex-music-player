import { Box, CircularProgress } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMeasure } from 'react-use';
import Toast from '../../components/toast/Toast';
import { usePlaylists, useSettings, useTopTracks } from '../../hooks/queryHooks';
import Footer from '../footer/Footer';
import MiniNavbar from '../sidebars/navbar/MiniNavbar';
import Navbar from '../sidebars/navbar/Navbar';
import CompactQueue from '../sidebars/queue/CompactQueue';
import Queue from '../sidebars/queue/Queue';

const Content = () => {
  const location = useLocation();
  const [index, setIndex] = useState(1);
  const [ref, { width }] = useMeasure();
  const { data: settings } = useSettings();
  const { isLoading: playlistLoading } = usePlaylists();
  const { isLoading: hotTracksLoading } = useTopTracks({ limit: 300, seconds: 60 * 60 * 24 * 90 });

  if (playlistLoading || hotTracksLoading) {
    return (
      <Box
        alignItems="center"
        bgcolor="background.default"
        display="flex"
        height="100vh"
        justifyContent="center"
      >
        <CircularProgress disableShrink />
      </Box>
    );
  }

  return (
    <>
      <Box
        bgcolor="action.hover"
        height="100vh"
        id="background"
        width="100vw"
      />
      <Box
        display="flex"
        height="calc(100vh - 140px)"
        position="absolute"
        top={50}
        width="100vw"
      >
        <Box
          display="flex"
          flexDirection="column"
          flexShrink={0}
          mb="4px"
          width={settings.compactNav ? 52 : 300}
        >
          {settings.compactNav && (
            <MiniNavbar />
          )}
          {!settings.compactNav && (
            <Navbar />
          )}
        </Box>
        <Box
          bgcolor="background.default"
          border="1px solid"
          borderColor="border.main"
          borderRadius="4px"
          flexGrow={1}
          margin="4px"
          marginTop={0}
          sx={{ contain: 'paint' }}
          zIndex={800}
        >
          <Box height={1} maxWidth={1600} mx="auto" ref={ref}>
            <AnimatePresence exitBeforeEnter>
              <Outlet context={{ width }} key={location.pathname} />
            </AnimatePresence>
          </Box>
        </Box>
        {settings.dockedQueue && (
          <Box flexShrink={0} width={300}>
            <Queue index={index} setIndex={setIndex} />
          </Box>
        )}
        {settings.compactQueue && (
          <Box flexShrink={0} width={52}>
            <CompactQueue />
          </Box>
        )}
      </Box>
      <Toast />
      <Footer />
    </>
  );
};

export default Content;
