import { AlertColor, PaletteMode } from '@mui/material';
import { Account, Artist, Device, Library, PlayQueueItem } from 'hex-plex';
import React from 'react';
import { ConnectDragSource } from 'react-dnd';
import { Location } from 'react-router-dom';

export interface IAppInfo {
  appName: string;
  appVersion: string;
  hostname: string;
  platform: string;
  version: string;
}

export interface IAppSettings {
  albumSort?: { by: string, order: string };
  albumText?: boolean;
  apiKey?: string;
  colorMode?: PaletteMode;
  compactNav?: boolean;
  compactQueue?: boolean,
  dockedQueue?: boolean;
  repeat?: 'repeat-none' | 'repeat-one' | 'repeat-all'
}

export interface IAuth {
  account: Account;
  server: Device;
  library: Library;
}

export interface IConfig {
  clientId?: string;
  queueId?: number;
  sectionId?: number;
  serverName?: string;
  token?: string;
}

export interface Filter {
  artist: Artist['guid'];
  exclusions: Artist['guid'][];
}

export interface IElectronAPI {
  maximize: () => void;
  minimize: () => void;
  quit: () => void;
  unmaximize: () => void;
  getAppInfo: () => IAppInfo;
  readConfig: (key: string) => IAppSettings | IConfig;
  writeConfig: (key: string, value: any) => IAppSettings | IConfig;
  readFilters: (key: string) => Filter[];
  writeFilters: (key: string, value: any) => Filter[];
  updatePlaying: (key: 'playing', value: boolean) => void;
  receive: (channel: string, func: (action: { event: string }) => void) => () => void;
}

export interface IVirtuosoContext {
  drag: ConnectDragSource,
  getFormattedTime: (inMs: number) => string;
  handleClickAway: () => void;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  selectedRows: number[];
}

export interface LocationWithState extends Location {
  state: { guid: string, title: string, sort: string }
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
