export interface LastFmArtist {
  name: string;
  mbid: string;
  url: string;
}

export interface LastFmStreamable {
  '#text': string;
  fulltrack: string;
}

export interface LastFmImage {
  '#text': string;
  size: string;
}

export interface LastFmAttr {
  position: string;
}

export interface LastFmAlbum {
  artist: string;
  title: string;
  mbid: string;
  url: string;
  image: LastFmImage[];
  '@attr': Attr;
}

export interface LastFmTag {
  name: string;
  url: string;
}

export interface LastFmToptags {
  tag: LastFmTag[];
}

export interface LastFmWiki {
  published: string;
  summary: string;
  content: string;
}

export interface LastFmGenreTag {
  name: string;
  reach: number;
  total: number;
  wiki: LastFmWiki;
}

export interface LastFmSearchResult {
  artist: string;
  image: LastFmImage[];
  listeners: string;
  mbid: string;
  name: string;
  streamable: string;
  url: string;
}

export interface LastFmTrack {
  name: string;
  mbid: string;
  url: string;
  duration: string;
  streamable: LastFmStreamable;
  listeners: string;
  playcount: string;
  artist: LastFmArtist;
  album: LastFmAlbum;
  toptags: LastFmToptags;
  wiki: LastFmWiki;
}
