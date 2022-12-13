import { useQuery } from '@tanstack/react-query';
// @ts-ignore
import Vibrant from 'node-vibrant/dist/vibrant';

export interface PaletteState {
  vibrant: string;
  muted: string;
  darkVibrant: string;
  darkMuted: string;
  lightVibrant: string;
  lightMuted: string;
}

export const defaultColors: PaletteState = {
  vibrant: '#cccccc',
  muted: '#cccccc',
  darkVibrant: '#cccccc',
  darkMuted: '#cccccc',
  lightVibrant: '#cccccc',
  lightMuted: '#cccccc',
};

const usePalette = (src: string, url: string) => useQuery(
  ['palette', src],
  () => Vibrant.from(`${url}&extra=1`)
    .getPalette((err: any, palette: any) => palette),
  {
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    select: (data) => ({
      darkMuted: data.DarkMuted.getHex(),
      darkVibrant: data.DarkVibrant.getHex(),
      lightMuted: data.LightMuted.getHex(),
      lightVibrant: data.LightVibrant.getHex(),
      muted: data.Muted.getHex(),
      vibrant: data.Vibrant.getHex(),
    } as PaletteState),
  },
);

export default usePalette;
