import React from 'react';
import { NavLink } from 'react-router-dom';
import { Track } from 'hex-plex';

const Subtext = ({ track, showAlbum }: {track: Track, showAlbum: boolean}) => (
  <>
    <NavLink
      className="link"
      state={{ guid: track.grandparentGuid, title: track.grandparentTitle }}
      style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
      to={`/artists/${track.grandparentId}`}
    >
      { track.originalTitle ? track.originalTitle : track.grandparentTitle }
    </NavLink>
    {showAlbum
      && (
        <>
          {' — '}
          <NavLink
            className="link"
            style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
            to={`/albums/${track.parentId}`}
          >
            { track.parentTitle }
          </NavLink>
        </>
      )}
  </>
);

export default Subtext;
