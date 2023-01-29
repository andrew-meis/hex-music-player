import { Box } from '@mui/material';
import { redirect, useLoaderData } from 'react-router-dom';
import {
  defaultSettings,
  useAuth, useConfig,
  useSettings,
} from 'queries/app-queries';
import initializeApp from 'scripts/initialize-app';
import CssTheme from './CssTheme';
import DragLayer from './DragLayer';
import Layout from './Layout';
import Player from './Player';
import PlexWebSocket from './PlexWebSocket';
import ThemeMode from './ThemeMode';
import type { IAppSettings, IConfig } from 'types/interfaces';

export const rootLoader = async () => {
  const config = window.electron.readConfig('config') as IConfig;
  const auth = await initializeApp(config);
  const savedSettings = window.electron.readConfig('settings') as IAppSettings;
  const settings = { ...defaultSettings, ...savedSettings } as IAppSettings;
  if (!config || !auth || !settings) {
    throw redirect('/login');
  }
  return { config, auth, settings };
};

const Root = () => {
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof rootLoader>>;
  useConfig(loaderData.config);
  useAuth(loaderData.auth);
  const { data: settings } = useSettings(loaderData.settings);
  const connection = loaderData.auth.server.connections
    .find((conn) => conn.uri === loaderData.auth.library.api.uri);

  return (
    <CssTheme>
      <ThemeMode settings={settings} />
      <DragLayer />
      <PlexWebSocket connection={connection} token={loaderData.auth.account.authToken} />
      <Player>
        <Box
          bgcolor="background.default"
          height="100vh"
          width="100vw"
        >
          <Layout settings={settings!} />
        </Box>
      </Player>
    </CssTheme>
  );
};

export default Root;
