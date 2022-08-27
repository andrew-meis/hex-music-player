import { useQueryClient } from '@tanstack/react-query';
import { Album } from 'hex-plex';
import { Artist } from 'hex-plex/dist/types/artist';
import { isEmpty } from 'lodash';

const useHideAlbum = () => {
  const queryClient = useQueryClient();
  return async (artist: Artist, album: Album) => {
    const filters = window.electron.readFilters('filters');
    if (isEmpty(filters)) {
      window.electron.writeFilters('filters', [{ artist: artist.guid, exclusions: [album.guid] }]);
      await queryClient.refetchQueries(['artist-appearances', artist.id]);
      return;
    }
    const index = filters.findIndex((obj) => obj.artist === artist.guid);
    if (index > -1) {
      const newExclusions = [...filters[index].exclusions, album.guid];
      filters[index] = { artist: artist.guid, exclusions: newExclusions };
    }
    if (index === -1) {
      filters.push({ artist: artist.guid, exclusions: [album.guid] });
    }
    window.electron.writeFilters('filters', filters);
    await queryClient.refetchQueries(['artist-appearances', artist.id]);
    await queryClient.refetchQueries(['artist-tracks', artist.id, 5]);
  };
};

export default useHideAlbum;
