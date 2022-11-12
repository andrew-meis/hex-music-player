import { Box, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import Authentication from './core/Authentication';
import ProtectedRoute from './core/ProtectedRoute';
import { useSettings } from './hooks/queryHooks';
import Album from './routes/album/Album';
import Albums from './routes/Albums';
import Artist from './routes/artist/Artist';
import SimilarArtists from './routes/artist/similar-artists/SimilarArtists';
import Artists from './routes/Artists';
import Charts from './routes/charts/Charts';
import Genres from './routes/Genres';
import Home from './routes/home/Home';
import Login from './routes/login/Login';
import Playlist from './routes/playlist/Playlist';
import Playlists from './routes/Playlists';
import Settings from './routes/settings/Settings';
import Tracks from './routes/Tracks';
import Content from './ui/content/Content';

const App = () => {
  const theme = useTheme();
  const searchContainer = useRef<HTMLDivElement>(null);
  const { data: settings } = useSettings();

  return (
    <Box
      bgcolor="background.default"
      height="100vh"
      style={{
        '--scrollbar': settings.colorMode === 'light'
          ? 'rgba(69, 69, 69, 0.5)'
          : 'rgba(255, 255, 255, 0.5)',
        '--menu-border': theme.palette.border.main,
        '--menu-color': theme.palette.text.primary,
        '--menu-paper': theme.palette.background.paper,
        '--menu-primary': theme.palette.primary.main,
        '--menu-transparent': `${theme.palette.primary.main}cc`,
      } as React.CSSProperties}
      width="100vw"
    >
      <Authentication>
        {(authenticated, setAuthenticated) => (
          <Routes>
            <Route
              element={(
                <ProtectedRoute
                  authenticated={authenticated}
                  searchContainer={searchContainer}
                  setAuthenticated={setAuthenticated}
                />
              )}
            >
              <Route element={<Content />} path="/">
                <Route element={<Albums />} path="/albums" />
                <Route element={<Album />} path="/albums/:id" />
                <Route element={<Artists />} path="/artists" />
                <Route element={<Artist />} path="/artists/:id" />
                <Route element={<SimilarArtists />} path="/artists/:id/similar" />
                <Route element={<Charts />} path="/charts" />
                <Route element={<Genres />} path="/genres" />
                <Route element={<Home />} path="/" />
                <Route element={<Playlists />} path="/playlists" />
                <Route element={<Playlist />} path="/playlists/:id" />
                <Route element={<Settings />} path="/settings" />
                <Route element={<Tracks />} path="/tracks" />
              </Route>
            </Route>
            <Route
              element={(
                <Login authenticated={authenticated} setAuthenticated={setAuthenticated} />
              )}
              path="/login"
            />
          </Routes>
        )}
      </Authentication>
    </Box>
  );
};

export default App;
