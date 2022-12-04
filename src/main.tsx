import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'styles/index.scss';
import Root, { rootLoader } from 'root/Root';
import Album from 'routes/album/Album';
import Albums from 'routes/Albums';
import Artist from 'routes/artist/Artist';
import SimilarArtists from 'routes/artist/similar-artists/SimilarArtists';
import Artists from 'routes/Artists';
import Charts from 'routes/charts/Charts';
import Genres from 'routes/Genres';
import Home from 'routes/home/Home';
import Login, { loginLoader } from 'routes/login/Login';
import Playlist from 'routes/playlist/Playlist';
import Playlists from 'routes/Playlists';
import Settings from 'routes/settings/Settings';
import Tracks from 'routes/Tracks';

const queryClient = new QueryClient();
const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/albums',
        element: <Albums />,
      },
      {
        path: '/albums/:id',
        element: <Album />,
      },
      {
        path: '/artists',
        element: <Artists />,
      },
      {
        path: '/artists/:id',
        element: <Artist />,
      },
      {
        path: '/artists/:id/similar',
        element: <SimilarArtists />,
      },
      {
        path: '/charts',
        element: <Charts />,
      },
      {
        path: '/genres',
        element: <Genres />,
      },
      {
        path: '/playlists',
        element: <Playlists />,
      },
      {
        path: '/playlists/:id',
        element: <Playlist />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/tracks',
        element: <Tracks />,
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
