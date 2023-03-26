import { useQuery } from '@tanstack/react-query';
import initializeApp from 'scripts/initialize-app';
import { AppSettings, AuthParams, AppConfig } from 'types/interfaces';

export const appQueryKeys = {
  config: ['core', { data: 'config' }],
  auth: ['core', { data: 'auth' }],
  settings: ['core', { data: 'settings' }],
};

export const defaultSettings: AppSettings = {
  albumSort: { by: 'date', order: 'asc' },
  albumText: true,
  colorMode: 'dark',
  compactNav: false,
  compactQueue: false,
  dockedQueue: true,
  repeat: 'repeat-none',
};

export const useConfig = (initialData?: AppConfig) => useQuery(
  appQueryKeys.config,
  () => window.electron.readConfig('config') as AppConfig,
  {
    initialData: initialData || window.electron.readConfig('config') as AppConfig,
    refetchOnMount: false,
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: false,
  },
);

export const useQueueId = () => {
  const { data: config, isSuccess } = useConfig();
  if (config && isSuccess) {
    return (config.queueId === undefined ? 0 : config.queueId);
  }
  return 0;
};

export const useAuth = (initialData?: AuthParams) => {
  const config = useConfig();
  return useQuery(
    appQueryKeys.auth,
    () => initializeApp(config.data as AppConfig),
    {
      initialData,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      refetchOnWindowFocus: false,
      retry: false,
    },
  );
};

export const useAccount = () => {
  const { data: auth, isSuccess } = useAuth();
  if (auth && isSuccess) {
    return auth.account;
  }
  throw new Error('no account');
};

export const useLibrary = () => {
  const { data: auth, isSuccess } = useAuth();
  if (auth && isSuccess) {
    return auth.library;
  }
  throw new Error('no library');
};

export const useServer = () => {
  const { data: auth, isSuccess } = useAuth();
  if (auth && isSuccess) {
    return auth.server;
  }
  throw new Error('no server');
};

export const useSettings = (initialData?: AppSettings) => useQuery(
  appQueryKeys.settings,
  () => {
    const savedSettings = window.electron.readConfig('settings') as AppSettings;
    return { ...defaultSettings, ...savedSettings };
  },
  {
    initialData: initialData || (() => {
      if (Object.keys(window.electron.readConfig('settings')).length === 0) {
        return defaultSettings;
      }
      const savedSettings = window.electron.readConfig('settings') as AppSettings;
      return { ...defaultSettings, ...savedSettings };
    }),
    refetchOnMount: false,
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: false,
  },
);
