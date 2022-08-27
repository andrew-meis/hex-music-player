import { IElectronAPI } from '../src/types/interfaces';

declare global {
  interface Window {
    electron: IElectronAPI
  }
}
