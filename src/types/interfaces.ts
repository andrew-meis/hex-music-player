import { AlertColor, PaletteMode } from '@mui/material';
import { Location } from 'react-router-dom';
import { Account, Album, Device, Library } from 'api/index';
import { PlexSort } from 'classes';

export interface AlbumWithSection extends Album {
  section: string;
}

export interface AppInfo {
  appName: string;
  appVersion: string;
  hostname: string;
  platform: string;
  version: string;
}

export interface AppSettings {
  albumSort?: string;
  albumText?: boolean;
  apiKey?: string;
  colorMode?: PaletteMode;
  compactNav?: boolean;
  compactQueue?: boolean,
  dockedQueue?: boolean;
  primaryColor?: string;
  repeat?: 'repeat-none' | 'repeat-one' | 'repeat-all'
}

export interface AppConfig {
  clientId?: string;
  queueId?: number;
  sectionId?: number;
  serverName?: string;
  token?: string;
}

export interface AuthParams {
  account: Account;
  server: Device;
  library: Library;
}

export interface Filter {
  artist: string;
  exclusions: string[];
}

export interface ElectronAPI {
  maximize: () => void;
  minimize: () => void;
  quit: () => void;
  unmaximize: () => void;
  getAppInfo: () => AppInfo;
  readConfig: (key: string) => AppSettings | AppConfig;
  writeConfig: (key: string, value: any) => AppSettings | AppConfig;
  readFilters: (key: string) => Filter[];
  writeFilters: (key: string, value: any) => Filter[];
  updatePlaying: (key: 'playing', value: boolean) => void;
  receive: (channel: string, func: (action: { event: string }) => void) => () => void;
}

export interface CardMeasurements {
  IMAGE_SIZE: number;
  ROW_HEIGHT: number;
  ROW_WIDTH: number;
}

export interface LocationWithState extends Location {
  state: { guid: string, title: string, sort: PlexSort }
}

export interface PlayerState {
  duration?: number;
  isPlaying?: boolean;
  position?: number;
}

export interface RouteParams {
  id: string;
}

export interface ToastMessage {
  type: AlertColor | undefined;
  text: string;
}
