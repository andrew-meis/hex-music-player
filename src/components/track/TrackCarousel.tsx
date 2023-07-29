import { useSetAtom } from 'jotai';
import React, { useCallback, useEffect } from 'react';
import { Library, Track } from 'api/index';
import { TrackTableStatic } from 'components/track-table';
import usePlayback from 'hooks/usePlayback';
import { AppTrackViewSettings } from 'types/interfaces';
import { tableKeyAtom } from 'ui/footer/drawers/ColumnSettingsDrawer';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    ratingCount: false,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const TrackCarousel: React.FC<{
  library: Library,
  tracks: Track[],
  rows: number;
}> = ({ library, tracks, rows }) => {
  const setTableKey = useSetAtom(tableKeyAtom);
  const trackPage = tracks.slice(0, rows);
  const viewSettings = window.electron
    .readConfig('static-view-settings') as AppTrackViewSettings;
  const { playTracks } = usePlayback();

  useEffect(() => {
    setTableKey('static');
    return () => setTableKey('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
  ) => {
    playTracks(tracks, shuffle, key);
  }, [playTracks, tracks]);

  return (
    <TrackTableStatic
      columnOptions={
        typeof viewSettings !== 'undefined'
          ? viewSettings.columns
          : defaultViewSettings.columns
      }
      isViewCompact={
        typeof viewSettings !== 'undefined'
          ? viewSettings.compact
          : defaultViewSettings.compact
      }
      library={library}
      multiLineRating={
        typeof viewSettings !== 'undefined'
          ? viewSettings.multiLineRating
          : defaultViewSettings.multiLineRating
      }
      playbackFn={handlePlayNow}
      rows={trackPage || []}
      subtextOptions={{
        albumTitle: true,
        artistTitle: true,
        showSubtext: typeof viewSettings !== 'undefined'
          ? viewSettings.multiLineTitle
          : defaultViewSettings.multiLineTitle,
      }}
      tableKey="static"
    />
  );
};

export default React.memo(TrackCarousel);
