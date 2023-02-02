import axios from 'axios';
import { Account, Library, MediaType, Track } from 'hex-plex';
import { parseTrackContainer } from 'hex-plex/dist/types/track';
import { Result } from 'types/types';

export const searchQueryFn = async (library: Library, query: string) => {
  const response = await library.searchAll(query, 10);
  return response.hubs
    .filter((hub) => hub.type === 'artist' || hub.type === 'album' || hub.type === 'track')
    .map((option) => option.items)
    .flat() as Result[];
};

export const searchTracksQueryFn = async ({
  account, artist, library, title, sectionId,
} : {
  account: Account, artist: string, title: string, library: Library, sectionId: number
}) => {
  const params = new URLSearchParams();
  params.append('push', '1');
  params.append('artist.title', artist);
  if (artist.includes('’')) {
    params.append('or', '1');
    params.append('artist.title', artist.replace(/[’]/g, "'"));
    params.append('or', '1');
    params.append('artist.title', artist.replace(/[’]/g, ''));
  }
  if (artist.includes("'")) {
    params.append('or', '1');
    params.append('artist.title', artist.replace(/[']/g, '’'));
    params.append('or', '1');
    params.append('artist.title', artist.replace(/[']/g, ''));
  }
  params.append('pop', '1');
  params.append('push', '1');
  params.append('track.title', title);
  if (title.includes('’')) {
    params.append('or', '1');
    params.append('track.title', title.replace(/[’]/g, "'"));
    params.append('or', '1');
    params.append('track.title', title.replace(/[’]/g, ''));
  }
  if (title.includes("'")) {
    params.append('or', '1');
    params.append('track.title', title.replace(/[']/g, '’'));
    params.append('or', '1');
    params.append('track.title', title.replace(/[']/g, ''));
  }
  params.append('pop', '1');
  params.append('type', MediaType.TRACK.toString());
  params.append('limit', '10');
  // eslint-disable-next-line prefer-template
  const url = library.api.uri
    + `/library/sections/${sectionId}`
    + `/search?${params.toString()}`
    + `&X-Plex-Token=${account.authToken}`;
  const response = await axios.get(url, { headers: library.api.headers() });
  return parseTrackContainer(response.data).tracks;
};

export const getTrackMatch = async ({
  artist, library, sectionId, title,
}: {
  artist: string,
  library: Library,
  sectionId: number,
  title: string,
}) => {
  const account = library.api.parent as Account;
  const regex = /\s[[(](?=[Ff]eat\.|[Ww]ith\s|[Ff]t\.|[Ff]eaturing\s)/;
  const searchTitle = title.split(regex)[0];
  const query = `${artist} ${searchTitle}`.split(' ').filter((t) => t.length > 1).join(' ');
  const searchResults = await searchQueryFn(library, query);
  const searchTrackResults = await searchTracksQueryFn({
    account,
    artist,
    title,
    library,
    sectionId,
  });
  const matchTrack = () => {
    if (searchTrackResults && searchResults) {
      const allTracks = [
        ...searchTrackResults,
        ...searchResults.filter((result) => result.type === 'track'),
      ] as Track[];
      if (allTracks.length === 0) return undefined;
      const nameMatch = allTracks?.find((track) => {
        const lastfmTitle = title.replace(/["'’“”]/g, '').toLowerCase();
        const plexTitle = track.title.replace(/["'’“”]/g, '').toLowerCase();
        return lastfmTitle === plexTitle;
      });
      if (nameMatch) return nameMatch;
      const alphanumericMatch = allTracks?.find((track) => {
        const lastfmTitle = title.replace(/\W+/g, ' ').trim().toLowerCase();
        const plexTitle = track.title.replace(/\W+/g, ' ').trim().toLowerCase();
        return lastfmTitle === plexTitle;
      });
      if (alphanumericMatch) return alphanumericMatch;
      const partialMatch = allTracks?.find((track) => {
        const lastfmTitle = title.replace(/["'’“”]/g, '').toLowerCase();
        const plexTitle = track.title.replace(/["'’“”]/g, '').toLowerCase();
        return lastfmTitle.includes(plexTitle);
      });
      if (partialMatch) return partialMatch;
      return undefined;
    }
    return undefined;
  };
  const match = matchTrack();
  return match;
};
