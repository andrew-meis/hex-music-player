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
});
