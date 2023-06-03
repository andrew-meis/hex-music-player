import { Box } from '@mui/material';
import { redirect, useLoaderData } from 'react-router-dom';
import {
  defaultSettings,
  useAuth, useConfig,
  useSettings,
} from 'queries/app-queries';
import initializeApp from 'scripts/initialize-app';
import { AppSettings, AppConfig } from 'types/interfaces';
import CssTheme from './CssTheme';
import DragLayer from './DragLayer';
import Layout from './Layout';
import Player from './Player';
import PlexWebSocket from './PlexWebSocket';
import ThemeMode from './ThemeMode';

export const rootLoader = async () => {
  const config = window.electron.readConfig('config') as AppConfig;
  const auth = await initializeApp(config);
  const savedSettings = window.electron.readConfig('settings') as AppSettings;
  const settings = { ...defaultSettings, ...savedSettings } as AppSettings;
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
    <CssTheme primaryColor={settings.primaryColor!}>
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
