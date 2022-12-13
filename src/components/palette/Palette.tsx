import {
  QueryObserverLoadingErrorResult,
  QueryObserverLoadingResult,
  QueryObserverRefetchErrorResult,
  QueryObserverSuccessResult,
} from '@tanstack/react-query';
import React from 'react';
import usePalette, { PaletteState } from 'hooks/usePalette';

export interface PaletteProps {
  src: string;
  url: string;
  children(palette: QueryObserverRefetchErrorResult<PaletteState, unknown>
    | QueryObserverSuccessResult<PaletteState, unknown>
    | QueryObserverLoadingErrorResult<PaletteState, unknown>
    | QueryObserverLoadingResult<PaletteState, unknown>): React.ReactNode;
}

const Palette = ({ src, url, children }: PaletteProps) => {
  const palette = usePalette(src, url);

  return <>{children(palette)}</>;
};

export default Palette;
