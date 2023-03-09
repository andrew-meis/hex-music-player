import { Box, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import 'styles/index.scss';
import Root, { rootLoader } from 'root/Root';
import Album from 'routes/album/Album';
import Albums from 'routes/Albums';
import Artist from 'routes/artist/Artist';
import ArtistTracks from 'routes/artist/subroutes/artist-tracks/ArtistTracks';
import Discography from 'routes/artist/subroutes/discography/Discography';
import RecentFavorites from 'routes/artist/subroutes/recent-favorites/RecentFavorites';
import SimilarArtists from 'routes/artist/subroutes/similar-artists/SimilarArtists';
import Artists from 'routes/artists/Artists';
import Charts from 'routes/charts/Charts';
import Genres from 'routes/Genres';
import Home from 'routes/home/Home';
import Login, { loginLoader } from 'routes/login/Login';
import LyricsComponent from 'routes/lyrics/LyricsComponent';
import Playlist from 'routes/playlist/Playlist';
import Playlists from 'routes/playlists/Playlists';
import Settings from 'routes/settings/Settings';
import SimilarTracks from 'routes/track/subroutes/similar-tracks/SimilarTracks';
import Track from 'routes/track/Track';
import Tracks from 'routes/tracks/Tracks';

const ErrorElement = () => (
  <Box alignItems="center" display="flex" flexDirection="column" height={1} justifyContent="center">
    <Typography color="text.primary" fontFamily="TT Commons" fontWeight={700} variant="h4">
      Oops!
    </Typography>
    <Typography color="text.primary">
      An unexpected error occurred.
    </Typography>
  </Box>
);

const queryClient = new QueryClient();
const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        path: '*',
        element: <ErrorElement />,
      },
      {
        path: '/',
        element: <Home />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/albums',
        element: <Albums />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/albums/:id',
        element: <Album />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/artists',
        element: <Artists />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/artists/:id',
        element: <Artist />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/artists/:id/discography',
        element: <Discography />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/artists/:id/recent',
        element: <RecentFavorites />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/artists/:id/similar',
        element: <SimilarArtists />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/artists/:id/tracks',
        element: <ArtistTracks />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/charts',
        element: <Charts />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/lyrics',
        element: <LyricsComponent />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/genres',
        element: <Genres />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/playlists',
        element: <Playlists />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/playlists/:id',
        element: <Playlist />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/settings',
        element: <Settings />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/tracks',
        element: <Tracks />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/tracks/:id',
        element: <Track />,
        errorElement: <ErrorElement />,
      },
      {
        path: '/tracks/:id/similar',
        element: <SimilarTracks />,
        errorElement: <ErrorElement />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
    loader: loginLoader,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
      </DndProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
