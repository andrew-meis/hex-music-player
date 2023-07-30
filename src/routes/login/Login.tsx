import { LoadingButton } from '@mui/lab';
import { Box, ButtonGroup, Fade, Paper, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import qs from 'qs';
import React, { useState } from 'react';
import { redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { Account, Client, Device, Library, ServerConnection } from 'api/index';
import CssTheme from 'root/CssTheme';
import { defaultSettings } from 'root/Root';
import ThemeMode from 'root/ThemeMode';
import initializeApp from 'scripts/initialize-app';
import { AppSettings, AppConfig } from 'types/interfaces';
import favicon from '../../assets/imgs/favicon.svg';
import Titlebar from './Titlebar';

const config = window.electron.readConfig('config') as AppConfig;
const sysInfo = window.electron.getAppInfo();

const normalizedPlatform = (platform: string): string => {
  switch (platform) {
    case 'darwin': return 'macOS';
    case 'linux': return 'Linux';
    case 'win32': return 'Windows';
    default: throw new Error('no matching platform');
  }
};

const client = new Client({
  identifier: config?.clientId || undefined,
  product: sysInfo.appName,
  version: sysInfo.appVersion,
  device: normalizedPlatform(sysInfo.platform),
  deviceName: sysInfo.hostname,
  platform: normalizedPlatform(sysInfo.platform),
  platformVersion: sysInfo.version,
});

const account = new Account(client);

const createAuthUrl = (pinCode: string): string => {
  const authAppUrl = qs.stringify({
    clientID: client.identifier,
    code: pinCode,
    context: {
      device: {
        device: client.device,
        deviceName: client.deviceName,
        product: client.product,
        version: client.version,
      },
    },
  });
  return `https://app.plex.tv/auth#?${authAppUrl}`;
};

export const loginLoader = async () => {
  const newConfig = window.electron.readConfig('config') as AppConfig;
  const auth = await initializeApp(newConfig);
  const savedSettings = window.electron.readConfig('settings') as AppSettings;
  const settings = { ...defaultSettings, ...savedSettings } as AppSettings;
  if (newConfig && auth && settings) {
    throw redirect('/');
  }
  return { newConfig, auth, settings };
};

const Login = () => {
  const { settings } = useLoaderData() as Awaited<ReturnType<typeof loginLoader>>;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadingButton, setLoadingButton] = useState(0);
  const [selectedServer, setSelectedServer] = useState<Device | undefined>(undefined);
  const [step, setStep] = useState('init');
  const { data: pinData } = useQuery(
    ['auth-url'],
    async () => {
      const response = await ky.post(
        'https://plex.tv/api/v2/pins',
        {
          headers: {
            accept: 'application/json',
          },
          searchParams: {
            'X-Plex-Client-Identifier': client.identifier,
            'X-Plex-Product': client.product,
            strong: true,
          },
        },
      ).json() as Record<string, any>;
      return { code: response.code, id: response.id };
    },
    {
      enabled: loadingButton === 0 && step === 'init',
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const { data: authToken } = useQuery(
    ['auth-token'],
    async () => {
      const response = await ky(
        `https://plex.tv/api/v2/pins/${pinData?.id}`,
        {
          headers: {
            accept: 'application/json',
          },
          searchParams: {
            code: pinData?.code,
            'X-Plex-Client-Identifier': client.identifier,
          },
        },
      ).json() as Record<string, any>;
      return response.authToken;
    },
    {
      enabled: loadingButton === 1,
      onSuccess: (data) => {
        if (data) {
          setLoadingButton(0);
          setStep('server');
        }
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: (data) => {
        if (!data) {
          return 2000;
        }
        return false;
      },
    },
  );
  const { data: servers } = useQuery(
    ['servers'],
    () => {
      account.authToken = authToken;
      return account.servers();
    },
    {
      enabled: !!authToken,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const { data: connection } = useQuery(
    ['connection', selectedServer?.name],
    async () => {
      const promises = selectedServer!.connections.map((conn, index) => {
        const { uri } = selectedServer!.connections[index];
        return ky(`${uri}/servers?X-Plex-Token=${selectedServer!.accessToken}`, {
          timeout: 10000,
        });
      });
      const response = await Promise.race(promises);
      return selectedServer!.connections
        .find((conn) => conn.uri === response.url.split('/servers')[0])!;
    },
    {
      enabled: !!selectedServer,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const { data: librarySections } = useQuery(
    ['library-sections'],
    async () => {
      const serverConnection = new ServerConnection(connection!.uri, account);
      const library = new Library(serverConnection);
      const sectionContainer = await library.sections();
      return sectionContainer.sections.filter((section) => section.type === 'artist');
    },
    {
      enabled: !!connection,
      onSuccess: () => {
        setLoadingButton(0);
        setStep('library');
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const finishLogin = async (key: number) => {
    window.electron.writeConfig('config', {
      clientId: client.identifier,
      sectionId: key,
      serverName: selectedServer?.name,
      token: account.authToken,
    });
    setTimeout(() => {
      queryClient.removeQueries(['auth-url']);
      queryClient.removeQueries(['auth-token']);
      queryClient.removeQueries(['servers']);
      queryClient.removeQueries(['connection']);
      queryClient.removeQueries(['library-sections']);
    }, 5000);
    navigate('/');
  };

  return (
    <CssTheme primaryColor={settings.primaryColor!}>
      <ThemeMode settings={settings} />
      <Box
        bgcolor="background.default"
        height="100vh"
        style={{
          '--scrollbar': settings!.colorMode === 'light'
            ? 'rgba(69, 69, 69, 0.5)'
            : 'rgba(255, 255, 255, 0.5)',
        } as React.CSSProperties}
        width="100vw"
      >
        {sysInfo.platform !== 'darwin' && (
          <Titlebar />
        )}
        <Fade in={!!pinData} timeout={500}>
          <Box
            alignItems="center"
            component={Paper}
            display="flex"
            elevation={4}
            flexDirection="column"
            height={400}
            justifyContent="flex-start"
            mx="auto"
            position="relative"
            sx={{
              transform: 'translate(0, 36%)',
            }}
            width={600}
          >
            <Box
              alignItems="center"
              borderRadius="4px"
              display="flex"
              justifyContent="center"
              marginBottom="auto"
              marginTop="16px"
              paddingX="16px"
              sx={{
                backgroundColor: 'primary.main',
              }}
              width={1}
            >
              <img
                alt="logo"
                src={favicon}
                style={{
                  height: 70,
                  width: 70,
                }}
              />
              <Typography
                color="white"
                fontFamily="TT Commons, sans-serif"
                fontSize="1.75rem"
                fontWeight={700}
              >
                Hex Music Player
              </Typography>
            </Box>
            {pinData && !authToken && (
              <Fade appear exit in>
                <Box
                  position="absolute"
                  sx={{
                    transform: 'translateY(32px)',
                  }}
                  top="40%"
                >
                  <LoadingButton
                    href={createAuthUrl(pinData.code)}
                    loading={loadingButton === 1}
                    rel="noreferrer"
                    size="large"
                    sx={{
                      width: 200,
                    }}
                    target="_blank"
                    variant="contained"
                    onClick={() => setLoadingButton(1)}
                  >
                    <Typography
                      color={loadingButton === 1 ? '' : 'background.default'}
                      textTransform="none"
                    >
                      Login to Plex
                    </Typography>
                  </LoadingButton>
                </Box>
              </Fade>
            )}
            {!!servers && selectedServer === undefined && (
              <Fade appear exit in>
                <Box
                  display="flex"
                  flexDirection="column"
                  position="absolute"
                  top="40%"
                >
                  <Typography
                    color="text.primary"
                    fontSize="0.8rem"
                    lineHeight={2.501}
                    variant="overline"
                  >
                    Select server:
                  </Typography>
                  <ButtonGroup orientation="vertical" variant="outlined">
                    {servers.devices.map((server) => (
                      <LoadingButton
                        key={server.id}
                        loading={loadingButton === 2}
                        size="large"
                        sx={{
                          width: 200,
                        }}
                        variant="outlined"
                        onClick={() => {
                          setSelectedServer(server);
                          setLoadingButton(2);
                        }}
                      >
                        <Typography textTransform="none">
                          {server.name}
                        </Typography>
                      </LoadingButton>
                    ))}
                  </ButtonGroup>
                </Box>
              </Fade>
            )}
            {!!librarySections && step === 'library' && (
              <Fade appear exit in>
                <Box
                  display="flex"
                  flexDirection="column"
                  position="absolute"
                  top="40%"
                >
                  <Typography
                    color="text.primary"
                    fontSize="0.8rem"
                    lineHeight={2.501}
                    variant="overline"
                  >
                    Select music library:
                  </Typography>
                  <ButtonGroup orientation="vertical" variant="outlined">
                    {librarySections
                      .map((section) => (
                        <LoadingButton
                          key={section.uuid}
                          size="large"
                          sx={{
                            width: 200,
                          }}
                          variant="outlined"
                          onClick={() => finishLogin(section.id)}
                        >
                          <Typography textTransform="none">
                            {section.title}
                          </Typography>
                        </LoadingButton>
                      ))}
                  </ButtonGroup>
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>
      </Box>
    </CssTheme>
  );
};

export default Login;
