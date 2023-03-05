import { Box, CircularProgress } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMeasure } from 'react-use';
import Toast from 'components/toast/Toast';
import { useLibrary } from 'queries/app-queries';
import { usePlaylists } from 'queries/playlist-queries';
import { IAppSettings } from 'types/interfaces';
import Footer from 'ui/footer/Footer';
import MiniNavbar from 'ui/sidebars/navbar/MiniNavbar';
import Navbar from 'ui/sidebars/navbar/Navbar';
import CompactQueue from 'ui/sidebars/queue/CompactQueue';
import Queue from 'ui/sidebars/queue/Queue';
import Titlebar from 'ui/titlebar/Titlebar';

const Layout = ({ settings }: {settings: IAppSettings}) => {
  const library = useLibrary();
  const location = useLocation();
  const searchContainer = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(1);
  const [ref, { width, height }] = useMeasure();
  const playlists = usePlaylists(library);

  if (playlists.isLoading) {
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
        bgcolor={settings.colorMode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.04)'}
        height="100vh"
        id="background"
        width="100vw"
      />
      <Titlebar searchContainer={searchContainer} />
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
          sx={{ contain: 'paint' }}
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
            <AnimatePresence mode="wait">
              <Outlet context={{ width, height }} key={location.pathname} />
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

export default Layout;
