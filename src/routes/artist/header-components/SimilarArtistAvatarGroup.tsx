import { Avatar, AvatarGroup, Box, SvgIcon } from '@mui/material';
import { BiChevronRight, IoMdMicrophone } from 'react-icons/all';
import { Link, NavigateFunction } from 'react-router-dom';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import Tooltip from 'components/tooltip/Tooltip';
import type { Artist, Library } from 'hex-plex';

interface SimilarArtistAvatarGroupProps {
  artist: Artist;
  library: Library;
  navigate: NavigateFunction;
  similarArtists: Artist[];
  width: number;
}

const SimilarArtistAvatarGroup = ({
  artist, library, navigate, similarArtists, width,
}: SimilarArtistAvatarGroupProps) => (
  <Box display="flex" flexDirection="column" margin="auto" width={width * 0.89}>
    <MotionTypography
      color="text.primary"
      fontFamily="TT Commons"
      fontSize="1.625rem"
      whileHover="hover"
      width="fit-content"
    >
      <Link
        className="link"
        to={`/artists/${artist.id}/similar`}
      >
        Similar Artists
        <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
          <BiChevronRight />
        </MotionSvg>
      </Link>
    </MotionTypography>
    <AvatarGroup
      componentsProps={{
        additionalAvatar: { onClick: () => navigate(`/artists/${artist.id}/similar`) },
      }}
      max={similarArtists.length < 6 ? similarArtists.length - 1 : 6}
      sx={{
        justifyContent: 'flex-end',
        marginTop: '12px',
        '& .MuiAvatar-root': {
          border: 'none',
          cursor: 'pointer',
          height: 59,
          width: 59,
          transform: 'scale(0.95)',
          transition: '0.2s',
          '&:hover': { transform: 'scale(1) translateZ(0px)' },
        },
      }}
    >
      {similarArtists?.map((similarArtist) => {
        const thumbSrc = library.api
          .getAuthenticatedUrl(
            '/photo/:/transcode',
            { url: similarArtist.thumb, width: 100, height: 100 },
          );
        return (
          <Tooltip
            key={similarArtist.id}
            title={similarArtist.title}
          >
            <Avatar
              alt={similarArtist.title}
              src={similarArtist.thumb ? thumbSrc : ''}
              sx={{
                filter: 'grayscale(60%)',
                '&:hover': { filter: 'none' },
              }}
              onClick={() => navigate(
                `/artists/${similarArtist.id}`,
                { state: { guid: similarArtist.guid, title: similarArtist.title } },
              )}
            >
              <SvgIcon className="generic-artist" sx={{ height: '65%', width: '65%' }}>
                <IoMdMicrophone />
              </SvgIcon>
            </Avatar>
          </Tooltip>
        );
      })}
    </AvatarGroup>
  </Box>
);

export default SimilarArtistAvatarGroup;
