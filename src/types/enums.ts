export enum DragTypes {
  ALBUM = 'album',
  ARTIST = 'artist',
  GENRE = 'genre',
  PLAYLIST = 'playlist',
  PLAYLIST_ITEM = 'playlist-item',
  PLAYQUEUE_ITEM = 'playqueue-item',
  TRACK = 'track',
}

export enum PlayActions {
  ADD_TRACK,
  ADD_TRACK_LAST,
  ADD_TRACKS,
  ADD_TRACKS_LAST,
  DO_NOTHING,
  PLAY_ALBUM,
  PLAY_ALBUM_AT_TRACK,
  PLAY_ALBUM_RADIO,
  PLAY_ARTIST,
  PLAY_ARTIST_RADIO,
  PLAY_GENRE,
  PLAY_PLAYLIST,
  PLAY_TRACK,
  PLAY_TRACK_RADIO,
  PLAY_TRACKS,
}

export enum AlbumSortKeys {
  ADDED_AT = 'addedAt',
  ARTIST_TITLE = 'artist.titleSort',
  LAST_PLAYED = 'lastViewedAt',
  PLAYCOUNT = 'viewCount',
  RANDOM = 'random',
  RATING = 'userRating',
  RELEASE_DATE = 'originallyAvailableAt',
  TITLE = 'titleSort',
  YEAR = 'year',
}

export enum ArtistSortKeys {
  ADDED_AT = 'addedAt',
  LAST_PLAYED = 'lastViewedAt',
  LAST_RATED = 'lastRatedAt',
  PLAYCOUNT = 'viewCount',
  RANDOM = 'random',
  RATING = 'userRating',
  TITLE = 'titleSort',
}

export enum TrackSortKeys {
  ADDED_AT = 'album.addedAt',
  ALBUM_TITLE = 'album.titleSort',
  ARTIST_TITLE = 'artist.titleSort',
  BITRATE = 'mediaBitrate',
  DURATION = 'duration',
  LAST_PLAYED = 'lastViewedAt',
  LAST_RATED = 'lastRatedAt',
  PLAYCOUNT = 'viewCount',
  POPULARITY = 'ratingCount',
  RATING = 'userRating',
  RELEASE_DATE = 'album.originallyAvailableAt',
  TRACK_TITLE = 'titleSort',
  TRACKNUMBER = 'track.index',
  VIEWED_AT = 'viewedAt',
}

export enum HexSortKeys {
  ADDED_AT = 'addedAt',
  LAST_PLAYED = 'lastViewedAt',
  PLAYCOUNT = 'viewCount',
  RELEASE_DATE = 'originallyAvailableAt',
  SECTION = 'section',
  TITLE = 'title',
}

export enum QueryKeys {
  ALBUM = 'album',
  ALBUM_QUICK = 'album-quick',
  ALBUM_TRACKS = 'album-tracks',
  ALBUMS = 'albums',
  ALBUMS_BY_GENRE = 'albums-by-genre',
  ALL_ALBUMS = 'all-albums',
  ALL_ARTISTS = 'all-artists',
  ALL_TRACKS = 'all-tracks',
  ARTIST = 'artist',
  ARTIST_APPEARANCES = 'artist-appearances',
  ARTIST_TRACKS = 'artist-tracks',
  ARTISTS = 'artists',
  ARTISTS_BY_GENRE = 'artists-by-genre',
  FILTERS = 'filters', // only updated programmatically
  GENRES = 'genres',
  HISTORY = 'history',
  LASTFM_SEARCH = 'lastfm-search',
  LASTFM_SIMILAR = 'lastfm-similar',
  LASTFM_TAG = 'lastfm-tag',
  LASTFM_TRACK = 'lastfm-track',
  LIMIT = 'limit', // only updated programmatically
  LYRICS = 'lyrics',
  PALETTE = 'palette',
  PLAY_POSITION = 'play-position',
  PLAYER_STATE= 'player-state',
  PLAYLIST = 'playlist',
  PLAYLIST_ITEMS = 'playlist-items',
  PLAYLISTS = 'playlists',
  PLAYQUEUE = 'play-queue',
  RECENT_TRACKS = 'recent-tracks',
  SEARCH = 'search',
  SEARCH_PAGE = 'search-page',
  SEARCH_TRACKS = 'search-tracks',
  SIMILAR_TRACKS = 'similar-tracks',
  SORT_ALBUMS = 'sort-albums', // only updated programmatically
  SORT_ARTISTS = 'sort-artists', // only updated programmatically
  SORT_TRACKS = 'sort-tracks', // only updated programmatically
  TOAST = 'toast',
  TOP = 'top',
  TRACK = 'track',
  TRACKS_BY_GENRE = 'tracks-by-genre',
  USER = 'user',
}

export enum SortOrders {
  ASC = 'asc',
  DESC = 'desc',
}
