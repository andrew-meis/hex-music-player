import { Avatar, AvatarGroup, SvgIcon, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { IoMdMicrophone } from 'react-icons/all';
import { NavigateFunction } from 'react-router-dom';
import type { Artist, Library } from 'hex-plex';

interface SimilarArtistAvatarGroupProps {
  artist: Artist;
  library: Library;
  navigate: NavigateFunction;
  similarArtists: Artist[];
}

const SimilarArtistAvatarGroup = ({
  artist, library, navigate, similarArtists,
}: SimilarArtistAvatarGroupProps) => (
  <>
    <AvatarGroup
      componentsProps={{
        additionalAvatar: { onClick: () => navigate(`/artists/${artist.id}/similar`) },
      }}
      max={similarArtists.length < 5 ? similarArtists.length - 1 : 5}
      sx={{
        marginLeft: 'auto',
        '& .MuiAvatar-root': {
          border: 'none',
          cursor: 'pointer',
          height: 54,
          width: 54,
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
            arrow
            enterDelay={500}
            enterNextDelay={300}
            key={similarArtist.id}
            title={(
              <Typography color="common.white" textAlign="center">
                {similarArtist.title}
              </Typography>
            )}
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
    {similarArtists
      && (
        <Typography
          position="absolute"
          sx={{ top: '-8px', right: '4px' }}
          variant="subtitle2"
        >
          similar artists
        </Typography>
      )}
  </>
);

export default SimilarArtistAvatarGroup;
