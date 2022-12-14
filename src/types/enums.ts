export enum DragActions {
  COPY_ALBUM = 'copy-album',
  COPY_ARTIST = 'copy-artist',
  COPY_TRACK = 'copy-track',
  COPY_TRACKS = 'copy-tracks',
  MOVE_TRACK = 'move-track',
  MOVE_TRACKS = 'move-tracks',
}

export enum PlayActions {
  ADD_TRACK,
  ADD_TRACK_LAST,
  ADD_TRACKS,
  ADD_TRACKS_LAST,
  DO_NOTHING,
  PLAY_ALBUM,
  PLAY_ALBUM_AT_TRACK,
  PLAY_ARTIST,
  PLAY_ARTIST_RADIO,
  PLAY_PLAYLIST,
  PLAY_PLAYLIST_AT_TRACK,
  PLAY_TRACK,
  PLAY_TRACK_RADIO,
  PLAY_TRACKS,
}

export enum PlexSortKeys {
  ADDED_AT = 'album.addedAt',
  ALBUM_TITLE = 'album.titleSort',
  ARTIST_TITLE = 'artist.titleSort',
  TRACK_TITLE = 'titleSort',
  DURATION = 'duration',
  LAST_PLAYED = 'lastViewedAt',
  PLAYCOUNT = 'viewCount',
  POPULARITY = 'ratingCount',
  RATING = 'userRating',
  RELEASE_DATE = 'album.originallyAvailableAt',
  TRACKNUMBER = 'track.index',
}

export enum SortOrders {
  ASC = ':asc',
  DESC = ':desc',
}
