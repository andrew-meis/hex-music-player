import { Box } from '@mui/material';
import { atom, useAtomValue } from 'jotai';
import { atomWithStorage, useHydrateAtoms } from 'jotai/utils';
import { isNumber, isObject } from 'lodash';
import { redirect, useLoaderData } from 'react-router-dom';
import { Account, Device, Library } from 'api/index';
import initializeApp from 'scripts/initialize-app';
import { AppSettings, AppConfig, AuthParams } from 'types/interfaces';
import CssTheme from './CssTheme';
import DragLayer from './DragLayer';
import Layout from './Layout';
import Player from './Player';
import PlexWebSocket from './PlexWebSocket';
import ThemeMode from './ThemeMode';

export const defaultSettings: AppSettings = {
  albumSort: 'originallyAvailableAt:asc',
  albumText: true,
  colorMode: 'dark',
  compactNav: false,
  compactQueue: false,
  dockedQueue: true,
  primaryColor: '#1caf7b',
  repeat: 'repeat-none',
};

export const authAtom = atom<AuthParams | undefined>(undefined);
export const accountAtom = atom<Account>((get) => {
  const account = get(authAtom)?.account;
  if (!account) {
    throw new Error('no account');
  }
  return account;
});
export const libraryAtom = atom<Library>((get) => {
  const library = get(authAtom)?.library;
  if (!library) {
    throw new Error('no library');
  }
  return library;
});
export const serverAtom = atom<Device & { uri: string }>((get) => {
  const server = get(authAtom)?.server;
  if (!server) {
    throw new Error('no server');
  }
  return ({
    ...server,
    uri: `server://${server.clientIdentifier}/com.plexapp.plugins.library`,
  });
});

export const configAtom = atomWithStorage<AppConfig>('config', {}, {
  getItem: (key, initialValue) => {
    const savedValue = window.electron.readConfig(key);
    if (!isObject(savedValue)) return initialValue;
    return savedValue as AppConfig;
  },
  setItem: (key, newValue) => window.electron.writeConfig(key, newValue),
  removeItem: (key) => window.electron.writeConfig(key, {}),
});

export const queueIdAtom = atomWithStorage('queueId', 0, {
  getItem: (key, initialValue) => {
    const savedValue = window.electron.readConfig(key);
    if (!isNumber(savedValue)) return initialValue;
    return savedValue as number;
  },
  setItem: (key, newValue) => window.electron.writeConfig(key, newValue),
  removeItem: (key) => window.electron.writeConfig(key, 0),
});

export const settingsAtom = atomWithStorage<AppSettings>('settings', {
  albumSort: 'originallyAvailableAt:asc',
  albumText: true,
  colorMode: 'dark',
  compactNav: false,
  compactQueue: false,
  dockedQueue: true,
  primaryColor: '#1caf7b',
  repeat: 'repeat-none',
}, {
  getItem: (key, initialValue) => {
    const savedValue = window.electron.readConfig(key);
    if (!isObject(savedValue)) return initialValue;
    return savedValue as AppSettings;
  },
  setItem: (key, newValue) => window.electron.writeConfig(key, newValue),
  removeItem: (key) => window.electron.writeConfig(key, {}),
});

export const rootLoader = async () => {
  const config = window.electron.readConfig('config') as AppConfig;
  const auth = await initializeApp(config);
  const queueId = window.electron.readConfig('queueId') as number;
  const savedSettings = window.electron.readConfig('settings') as AppSettings;
  const settings = { ...defaultSettings, ...savedSettings } as AppSettings;
  if (!config || !auth || !settings) {
    throw redirect('/login');
  }
  return { config, auth, queueId, settings };
};

const Root = () => {
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof rootLoader>>;
  useHydrateAtoms([
    [authAtom, loaderData.auth],
    [configAtom, loaderData.config],
    [queueIdAtom, loaderData.queueId || 0],
    [settingsAtom, loaderData.settings],
  ]);
  const settings = useAtomValue(settingsAtom);
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
          <Layout settings={settings} />
        </Box>
      </Player>
    </CssTheme>
  );
};

export default Root;
