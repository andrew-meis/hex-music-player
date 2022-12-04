import { useQuery } from '@tanstack/react-query';
import { Artist } from 'hex-plex';
import { useGetArtist, useGetArtistAppearances, useGetArtistTracks } from 'hooks/artistHooks';

export const useArtist = (artistId: Artist['id']) => {
  const getArtist = useGetArtist();
  return useQuery(
    ['artist', artistId],
    () => getArtist(artistId),
    {
      enabled: artistId !== -1,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useArtistAppearances = (
  artistId: Artist['id'],
  artistTitle: Artist['title'],
  artistGuid: Artist['guid'],
) => {
  const getArtistAppearances = useGetArtistAppearances();
  return useQuery(
    ['artist-appearances', artistId],
    () => getArtistAppearances(artistId, artistTitle, artistGuid),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useArtistTracks = ({
  artistId, artistTitle, artistGuid, slice, limit,
}: {
  artistId: Artist['id'],
  artistTitle: Artist['title'],
  artistGuid: Artist['guid'],
  slice?: number,
  limit?: number,
}) => {
  const getArtistTracks = useGetArtistTracks();
  return useQuery(
    ['artist-tracks', artistId, slice],
    () => getArtistTracks({
      guid: artistGuid,
      id: artistId,
      title: artistTitle,
      limit,
      slice,
    }),
    {
      enabled: artistId !== -1,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};
