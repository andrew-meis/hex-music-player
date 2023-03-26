import { ElectronAPI } from '../src/types/interfaces';

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
