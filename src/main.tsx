import { Box, Button, Typography } from '@mui/material';
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
import Albums from 'routes/albums/Albums';
import Artist from 'routes/artist/Artist';
import ArtistTracks from 'routes/artist/subroutes/artist-tracks/ArtistTracks';
import Discography from 'routes/artist/subroutes/discography/Discography';
import RecentFavorites from 'routes/artist/subroutes/recent-favorites/RecentFavorites';
import SimilarArtists from 'routes/artist/subroutes/similar-artists/SimilarArtists';
import Artists from 'routes/artists/Artists';
import Charts from 'routes/charts/Charts';
import Genre from 'routes/genre/Genre';
import Genres from 'routes/genres/Genres';
import Home from 'routes/home/Home';
import Login, { loginLoader } from 'routes/login/Login';
import LyricsComponent from 'routes/lyrics/LyricsComponent';
import Playlist from 'routes/playlist/Playlist';
import Playlists from 'routes/playlists/Playlists';
import SearchResults from 'routes/search/SearchResults';
import Settings from 'routes/settings/Settings';
import SimilarTracks from 'routes/track/subroutes/similar-tracks/SimilarTracks';
import Track from 'routes/track/Track';
import Tracks from 'routes/tracks/Tracks';

const ErrorElement = ({ height }: { height?: string }) => (
  <Box
    alignItems="center"
    bgcolor="var(--mui-palette-background-paper)"
    display="flex"
    flexDirection="column"
    height={height}
    justifyContent="center"
  >
    <Typography
      color="var(--mui-palette-text-primary)"
      fontFamily="TT Commons, sans-serif"
      fontWeight={700}
      variant="h4"
    >
      Oops!
    </Typography>
    <Typography color="var(--mui-palette-text-primary)">
      An unexpected error occurred.
    </Typography>
    {height === '100vh' && (
      <Button
        sx={{
          borderColor: 'var(--mui-palette-primary-main)',
          color: 'var(--mui-palette-primary-main)',
          mt: 1,
          '&:hover': {
            borderColor: 'var(--mui-palette-primary-light)',
          },
        }}
        variant="outlined"
        onClick={() => window.location.reload()}
      >
        <Typography textTransform="none">
          Refresh app
        </Typography>
      </Button>
    )}
  </Box>
);

ErrorElement.defaultProps = {
  height: '100%',
};

const queryClient = new QueryClient();
const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorElement height="100vh" />,
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
        path: '/genres/:id',
        element: <Genre />,
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
        path: '/search',
        element: <SearchResults />,
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
