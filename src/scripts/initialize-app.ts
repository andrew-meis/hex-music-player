import ky from 'ky';
import { Account, Client, Connection, Library, ServerConnection } from 'api/index';
import { AuthParams, AppConfig } from 'types/interfaces';

const sysInfo = window.electron.getAppInfo();

const normalizedPlatform = (platform: string): string => {
  switch (platform) {
    case 'darwin': return 'macOS';
    case 'linux': return 'Linux';
    case 'win32': return 'Windows';
    default: throw new Error('no matching platform');
  }
};

const initializeApp = async (config: AppConfig) => {
  try {
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
    if (!server) {
      return undefined;
    }
    const promises = server?.connections.map((conn, index) => {
      const { uri } = server.connections[index];
      return ky(`${uri}/servers?X-Plex-Token=${server!.accessToken}`, {
        timeout: 10000,
      });
    });
    if (promises) {
      const connection: Connection = await Promise.race(promises)
        .then((r) => server!.connections.find((conn) => conn.uri === r.url.split('/servers')[0])!);
      const newAccount = new Account(client, server.accessToken);
      const serverConnection = new ServerConnection(connection.uri, newAccount);
      const library = new Library(serverConnection);
      return { account, server, library } as AuthParams;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

export default initializeApp;
