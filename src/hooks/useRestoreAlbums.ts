import { useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { QueryKeys } from 'types/enums';
import type { Artist } from 'hex-plex';

const useRestoreAlbums = () => {
  const queryClient = useQueryClient();
  return async (artist: Artist) => {
    const filters = window.electron.readFilters('filters');
    if (isEmpty(filters)) {
      window.electron.writeFilters('filters', [{ artist: artist.guid, exclusions: [] }]);
      await queryClient.refetchQueries([QueryKeys.ARTIST_APPEARANCES, artist.id]);
      await queryClient.refetchQueries([QueryKeys.ARTIST_TRACKS, artist.id, 5]);
      return;
    }
    const index = filters.findIndex((obj) => obj.artist === artist.guid);
    if (index > -1) {
      filters[index] = { artist: artist.guid, exclusions: [] };
    }
    if (index === -1) {
      filters.push({ artist: artist.guid, exclusions: [] });
    }
    window.electron.writeFilters('filters', filters);
    await queryClient.refetchQueries([QueryKeys.ARTIST_APPEARANCES, artist.id]);
    await queryClient.refetchQueries([QueryKeys.ARTIST_TRACKS, artist.id, 5]);
  };
};

export default useRestoreAlbums;
