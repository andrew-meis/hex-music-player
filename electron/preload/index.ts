/* eslint-disable consistent-return */
/* eslint-disable import/no-extraneous-dependencies */
// @ts-nocheck
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // window control
  maximize: () => ipcRenderer.send('app-maximize'),
  minimize: () => ipcRenderer.send('app-minimize'),
  quit: () => ipcRenderer.send('app-quit'),
  unmaximize: () => ipcRenderer.send('app-unmaximize'),
  // app settings
  getAppInfo: () => ipcRenderer.sendSync('get-app-info'),
  readConfig: (key) => ipcRenderer.sendSync('read-config', { key }),
  writeConfig: (key, value) => ipcRenderer.sendSync('write-config', { key, value }),
  readFilters: (key) => ipcRenderer.sendSync('read-config', { key }),
  writeFilters: (key, value) => ipcRenderer.sendSync('write-config', { key, value }),
  // communicate player state to and from main process
  updatePlaying: (key, value) => ipcRenderer.send('update-playing', { key, value }),
  receive: (channel, func) => {
    const validChannels = ['taskbar-controls'];
    if (validChannels.includes(channel)) {
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
  },
});
