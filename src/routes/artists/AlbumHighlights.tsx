import { Box } from '@mui/material';
import { Album, Artist, Hub, Library } from 'hex-plex';
import { useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { MotionAvatar } from 'components/motion-components/motion-components';
import Tooltip from 'components/tooltip/Tooltip';

interface AlbumHighlightsProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  cols: number;
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

const AlbumHighlights = ({
  artistData, cols, library, navigate, width,
}: AlbumHighlightsProps) => {
  const releases = useMemo(() => {
    if (!artistData) {
      return [];
    }
    const { albums } = artistData;
    const hubReleases = [] as Album[][];
    artistData.hubs.forEach((hub) => {
      if (hub.type === 'album' && hub.size > 0) {
        const objs = hub.items.map((album) => ({ ...album, section: hub.title })) as Album[];
        hubReleases.push(objs);
      }
    });
    const allReleases = [...albums, ...hubReleases.flat(1)];
    return allReleases.sort((a, b) => b.viewCount - a.viewCount).slice(0, cols);
  }, [artistData, cols]);

  const panelWidth = (width * 0.89) - 44;

  return (
    <>
      {releases.map((release) => {
        const thumbSrc = library.api.getAuthenticatedUrl(
          '/photo/:/transcode',
          { url: release.thumb, width: 300, height: 300 },
        );
        return (
          <Box
            alignItems="center"
            borderRadius="4px"
            display="flex"
            flexDirection="column"
            height="calc(100% - 45px)"
            key={release.id}
            sx={{
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/albums/${release.id}`)}
          >
            <Tooltip
              title={release.title}
            >
              <MotionAvatar
                alt={release.title}
                initial={{ scale: 0.95 }}
                src={thumbSrc}
                sx={{
                  height: panelWidth / cols,
                  width: panelWidth / cols,
                }}
                transition={{
                  duration: 0.4,
                }}
                variant="rounded"
                whileHover={{
                  scale: [null, 1.02, 1],
                }}
              />
            </Tooltip>
          </Box>
        );
      })}
    </>
  );
};

export default AlbumHighlights;
