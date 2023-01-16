import { Avatar, Box } from '@mui/material';
import { Album, Artist, Hub, Library } from 'hex-plex';
import { useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';
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
              transform: 'scale(0.95)',
              transition: '0.2s',
              '&:hover': { transform: 'scale(1)' },
            }}
            onClick={() => navigate(`/albums/${release.id}`)}
          >
            <Tooltip
              title={release.title}
            >
              <Avatar
                alt={release.title}
                src={thumbSrc}
                sx={{
                  height: panelWidth / cols,
                  width: panelWidth / cols,
                }}
                variant="rounded"
              />
            </Tooltip>
          </Box>
        );
      })}
    </>
  );
};

export default AlbumHighlights;
