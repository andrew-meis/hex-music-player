import { LoadingButton } from '@mui/lab';
import {
  Box, ButtonGroup, Fade, Paper, Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Account, Client, Device, Library, ServerConnection,
} from 'hex-plex';
import qs from 'qs';
import React, { useState } from 'react';
import { Config } from '../../types/interfaces';
import background from './imgs/album-cover-bg.png';
import darkLogo from './imgs/logo-with-white-text.svg';

const config = window.electron.readConfig('config') as Config;
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
  identifier: config.clientId,
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

interface LoginPageProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const LoginPage = ({ setAuthenticated }: LoginPageProps) => {
  const [disabled, setDisabled] = useState('');
  const [loadingButton, setLoadingButton] = useState(0);
  const [selectedServer, setSelectedServer] = useState<Device | undefined>();
  const [step, setStep] = useState('init');
  const { data: pinData } = useQuery(
    ['auth-url'],
    () => axios.post(
      'https://plex.tv/api/v2/pins',
      null,
      {
        headers: {
          accept: 'application/json',
        },
        params: {
          'X-Plex-Client-Identifier': client.identifier,
          'X-Plex-Product': client.product,
          strong: true,
        },
      },
    ).then((r) => ({ code: r.data.code, id: r.data.id })),
    {
      enabled: loadingButton === 0 && step === 'init',
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const { data: authToken } = useQuery(
    ['authToken'],
    () => axios.get(
      `https://plex.tv/api/v2/pins/${pinData?.id}`,
      {
        headers: {
          accept: 'application/json',
        },
        params: {
          code: pinData?.code,
          'X-Plex-Client-Identifier': client.identifier,
        },
      },
    )
      .then((r) => r.data.authToken),
    {
      enabled: loadingButton === 1,
      onSuccess: (data) => {
        if (data) {
          setLoadingButton(0);
          setDisabled('login');
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
    ['connection'],
    () => {
      const promises = selectedServer?.connections.map((conn, index) => {
        const { uri } = selectedServer.connections[index];
        return axios.get(`${uri}/servers?X-Plex-Token=${selectedServer.accessToken}`, {
          timeout: 10000,
          data: conn,
        });
      });
      if (promises) {
        return Promise.race(promises)
          .then((r) => JSON.parse(r.config.data))
          .catch((e) => console.error(e));
      }
      return undefined;
    },
    {
      enabled: !!selectedServer,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const { data: librarySections } = useQuery(
    ['librarySections'],
    () => {
      const serverConnection = new ServerConnection(connection.uri, account);
      const library = new Library(serverConnection);
      return library.sections()
        .then((sectionContainer) => sectionContainer.sections
          .filter((section) => section.type === 'artist'));
    },
    {
      enabled: !!connection,
      onSuccess: () => {
        setLoadingButton(0);
        setDisabled('all');
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
      queueId: 0,
      sectionId: key,
      serverName: selectedServer?.name,
      token: account.authToken,
    });
    setAuthenticated(true);
  };

  return (
    <>
      <Box
        height="100vh"
        position="absolute"
        sx={{
          backgroundImage: `url(${background})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          filter: 'grayscale(90%)',
        }}
        top={0}
        width={1}
      />
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
          <img
            alt="logo"
            src={darkLogo}
            style={{
              background: '#1caf7b',
              borderRadius: 4,
              height: 60,
              marginBottom: step === 'init' ? '120px' : '12px',
              marginTop: 16,
              paddingLeft: 16,
              paddingRight: 16,
              transition: 'margin 300ms ease-in',
              width: '100%',
            }}
          />
          {pinData && (
            <LoadingButton
              disabled={disabled === 'login' || disabled === 'all'}
              href={createAuthUrl(pinData.code)}
              loading={loadingButton === 1}
              rel="noreferrer"
              size="large"
              sx={{
                mb: step === 'init' || step === 'server' ? '60px' : '12px',
                transition: 'margin 300ms ease-in',
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
          )}
          {!!servers && selectedServer === undefined && (
            <Box mb={step === 'server' ? 'auto' : '12px'}>
              <Typography color="text.secondary" fontWeight={600}>
                Select server:
              </Typography>
              <ButtonGroup orientation="vertical" variant="outlined">
                {servers.devices.map((server) => (
                  <LoadingButton
                    disabled={disabled === 'all'}
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
          )}
          {!!servers && selectedServer !== undefined && (
            <Box mb={step === 'server' ? 'auto' : '12px'}>
              <Typography color="text.secondary" fontWeight={600}>
                Select server:
              </Typography>
              <LoadingButton
                disabled={disabled === 'all'}
                key={selectedServer.id}
                loading={loadingButton === 2}
                size="large"
                sx={{
                  width: 200,
                }}
                variant="outlined"
              >
                <Typography textTransform="none">
                  {selectedServer.name}
                </Typography>
              </LoadingButton>
            </Box>
          )}
          {!!librarySections && (
            <Box mb="auto">
              <Typography color="text.secondary" fontWeight={600}>
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
          )}
        </Box>
      </Fade>
    </>
  );
};

export default LoginPage;
