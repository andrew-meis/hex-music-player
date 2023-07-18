import React, { useCallback, useState } from 'react';
import { Library, Track } from 'api/index';
import TrackTableStatic from 'components/track-table/TrackTableStatic';
import usePlayback from 'hooks/usePlayback';
import { AppTrackViewSettings } from 'types/interfaces';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    globalViewCount: true,
    grandparentTitle: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    thumb: true,
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
  const trackPage = tracks.slice(0, rows);
  const viewSettings = window.electron
    .readConfig('track-preview-view-settings') as AppTrackViewSettings;
  const [open, setOpen] = useState(false);
  const { playTracks } = usePlayback();

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
      open={open}
      playbackFn={handlePlayNow}
      rows={trackPage || []}
      setOpen={setOpen}
      subtextOptions={{
        albumTitle: true,
        artistTitle: true,
        showSubtext: typeof viewSettings !== 'undefined'
          ? viewSettings.multiLineTitle
          : defaultViewSettings.multiLineTitle,
      }}
      viewKey="charts"
    />
  );
};

export default React.memo(TrackCarousel);
