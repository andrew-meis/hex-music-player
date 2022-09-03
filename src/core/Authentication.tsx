import axios from 'axios';
import {
  Account, Client, Connection, Library, ServerConnection,
} from 'hex-plex';
import React, { ReactNode, useState } from 'react';
import { useApp } from '../hooks/queryHooks';
import { Config } from '../types/interfaces';

const sysInfo = window.electron.getAppInfo();

const normalizedPlatform = (platform: string): string => {
  switch (platform) {
    case 'darwin': return 'macOS';
    case 'linux': return 'Linux';
    case 'win32': return 'Windows';
    default: throw new Error('no matching platform');
  }
};

export const initializeApp = async (config: Config) => {
  const client = new Client({
    identifier: config.clientId,
    product: sysInfo.appName,
    version: sysInfo.appVersion,
    device: normalizedPlatform(sysInfo.platform),
    deviceName: sysInfo.hostname,
    platform: normalizedPlatform(sysInfo.platform),
    platformVersion: sysInfo.version,
  });
  const account = new Account(client, config.token);
  const servers = await account.servers();
  const server = servers.devices.find((device) => device.name === config?.serverName);
  const promises = server?.connections.map((conn, index) => {
    const { uri } = server.connections[index];
    return axios.get(`${uri}/servers?X-Plex-Token=${server.accessToken}`, {
      timeout: 10000,
      data: conn,
    });
  });
  if (promises) {
    const connection: Connection = await Promise.race(promises)
      .then((r) => JSON.parse(r.config.data))
      .catch(() => { throw new Error('no valid connection'); });
    const serverConnection = new ServerConnection(connection.uri, account);
    const library = new Library(serverConnection);
    if (!server) {
      throw new Error('login failed');
    }
    return { account, server, library };
  }
  throw new Error('login failed');
};

interface AuthenticationProps {
  children(
    authenticated: string,
    setAuthenticated: React.Dispatch<React.SetStateAction<string>>
  ): ReactNode;
}

const Authentication = ({ children }: AuthenticationProps) => {
  const [authenticated, setAuthenticated] = useState<string>('unknown');
  const onError = () => {
    setAuthenticated('unauthenticated');
  };
  const onSuccess = () => {
    setAuthenticated('authenticated');
  };
  const appState = useApp(onSuccess, onError);

  if (appState.isLoading) {
    return null;
  }

  return <>{children(authenticated, setAuthenticated)}</>;
};

export default Authentication;
