import { useQuery } from '@tanstack/react-query';
// @ts-ignore
import Vibrant from 'node-vibrant/dist/vibrant';
import { QueryKeys } from 'types/enums';
import defaultSwatch from '../assets/imgs/shades.png';

export interface PaletteState {
  vibrant: string;
  muted: string;
  darkVibrant: string;
  darkMuted: string;
  lightVibrant: string;
  lightMuted: string;
}

export const defaultColors: PaletteState = {
  vibrant: '#dc849c',
  muted: '#772139',
  darkVibrant: '#671d31',
  darkMuted: '#772139',
  lightVibrant: '#fcf3c5',
  lightMuted: '#917a07',
};

const usePalette = (src: string, url: string) => useQuery(
  [QueryKeys.PALETTE, src],
  async () => {
    let data;
    try {
      data = await Vibrant.from(`${url}&extra=1`).getPalette();
    } catch {
      data = await Vibrant.from(defaultSwatch).getPalette();
    }
    return data;
  },
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
