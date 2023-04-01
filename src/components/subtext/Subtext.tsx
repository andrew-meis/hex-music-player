import { NavLink } from 'react-router-dom';
import { Track } from 'api/index';

const Subtext = ({ track, showAlbum }: {track: Track, showAlbum: boolean}) => (
  <>
    <NavLink
      className="link"
      state={{ guid: track.grandparentGuid, title: track.grandparentTitle }}
      style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
      to={`/artists/${track.grandparentId}`}
      onClick={(event) => event.stopPropagation()}
    >
      {track.originalTitle ? track.originalTitle : track.grandparentTitle}
    </NavLink>
    {showAlbum
      && (
        <>
          {' — '}
          <NavLink
            className="link"
            style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
            to={`/albums/${track.parentId}`}
            onClick={(event) => event.stopPropagation()}
          >
            {track.parentTitle}
          </NavLink>
        </>
      )}
  </>
);

export default Subtext;
