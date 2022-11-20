import { Box, Collapse, SvgIcon, Typography } from '@mui/material';
import { Artist } from 'hex-plex';
import React from 'react';
import { BiCaretUp, FaAngleDown, IoMdMicrophone } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import styles from 'styles/AlbumsRow.module.scss';
import HighlightAlbum from './HighlightAlbum';
import TopTracks from '../TopTracks';
import { RowProps, SimilarArtistContext } from './SimilarArtists';

const textStyle = {
  color: 'common.white',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  // fontWeight: 600,
  lineHeight: 1.2,
  mx: '14px',
  position: 'absolute',
  bottom: '28px',
  height: '40px',
};

interface ArtistCardProps {
  artist: Artist;
  context: SimilarArtistContext;
  index: number;
  rowIndex: number;
}

const ArtistCard = ({ artist, context, index, rowIndex }: ArtistCardProps) => {
  const {
    grid, library, openArtist, width, openCard, setOpenArtist, setOpenCard,
  } = context;
  const imgHeight = (Math.floor((width * 0.89) / grid.cols) * 1.3);
  const imgWidth = Math.floor((width * 0.89) / grid.cols);
  const open = openArtist.id === artist.id;
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: artist.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  const handleClick = () => {
    if (openCard.row === rowIndex && openCard.index === index) {
      setOpenArtist({
        id: -1,
        guid: '',
        title: '',
      });
      setOpenCard({ row: -1, index: -1 });
      return;
    }
    if (openCard.row === rowIndex) {
      setOpenArtist({
        id: artist.id,
        guid: artist.guid,
        title: artist.title,
      });
    }
    setOpenCard({ row: rowIndex, index });
  };

  return (
    <Box
      className={styles['album-box']}
      data-id={artist.id}
      height={imgHeight}
      key={artist.id}
      sx={{
        contain: 'paint',
      }}
      width={imgWidth}
      onClick={handleClick}
    >
      <Box
        bgcolor="action.selected"
        className={styles['album-cover']}
        flexDirection="column-reverse"
        height={imgHeight - 8}
        margin="4px"
        style={{
          alignItems: 'flex-end',
          borderRadius: '32px',
          transform: open ? 'scale(1) translateZ(0px)' : '',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        width={imgWidth - 8}
      >
        <Box
          height="68px"
          sx={{
            backgroundColor: open ? 'transparent' : 'rgba(60, 60, 70, 0.6)',
            borderBottomLeftRadius: '30px',
            borderBottomRightRadius: '30px',
            transition: '200ms',
          }}
          width={imgWidth - 8}
        />
        {!artist.thumb && (
          <SvgIcon
            className="generic-artist"
            sx={{ alignSelf: 'center', color: 'common.grey', height: '65%', width: '65%' }}
          >
            <IoMdMicrophone />
          </SvgIcon>
        )}
      </Box>
      <Typography
        sx={{
          ...textStyle,
          opacity: open ? 0 : 1,
          transition: '200ms',
        }}
      >
        {artist.title}
      </Typography>
      <SvgIcon
        sx={{
          bottom: '8px',
          color: 'common.white',
          position: 'absolute',
          width: '100%',
        }}
      >
        <FaAngleDown />
      </SvgIcon>
    </Box>
  );
};

const ArtistsRow = React.memo(({ index: rowIndex, context }: RowProps) => {
  const {
    grid,
    items: { rows },
    library,
    navigate,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    setOpenArtist,
    width,
    openCard,
  } = context;
  if (rows?.length === 0) {
    return (
      <Box height={1} />
    );
  }
  const { artists } = rows![rowIndex];
  const openIndex = openCard.index;
  const caretPos = (((width * 0.89) / grid.cols) * (openIndex + 1))
    - ((width * 0.89) / (grid.cols * 2));

  const handleEntered = () => {
    if (openArtist.id === artists[openIndex].id) {
      setOpenArtist({
        id: -1,
        guid: '',
        title: '',
      });
      return;
    }
    setOpenArtist({
      id: artists[openIndex].id,
      guid: artists[openIndex].guid,
      title: artists[openIndex].title,
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        mx="auto"
        width={(width * 0.89)}
      >
        {artists.map((artist, index) => (
          <ArtistCard
            artist={artist}
            context={context}
            index={index}
            key={artist.id}
            rowIndex={rowIndex}
          />
        ))}
      </Box>
      <Collapse
        in={openCard.row === rowIndex}
        onEntered={handleEntered}
      >
        <Box
          bgcolor="common.contrastGrey"
          borderRadius="24px"
          height={380}
          margin="auto"
          marginTop="12px"
          sx={{
            transform: 'translateZ(0px)',
          }}
          width="89%"
        >
          <SvgIcon
            sx={{
              color: 'common.contrastGrey',
              height: '1.5em',
              left: caretPos - 18,
              position: 'absolute',
              top: '-22px',
              width: '1.5em',
            }}
          >
            <BiCaretUp />
          </SvgIcon>
          {openArtist && openArtistQuery.data && openArtistTracksQuery.data && (
            <Box
              margin="auto"
              width="calc(100% - 48px)"
            >
              <Typography color="text.primary" fontFamily="TT Commons" fontSize="1.625rem" pt="6px">
                <NavLink
                  className="link"
                  state={{ guid: openArtist.guid, title: openArtist.title }}
                  to={`/artists/${openArtist.id}`}
                >
                  {openArtist.title}
                </NavLink>
              </Typography>
              <Box
                display="flex"
              >
                <TopTracks
                  context={context}
                  style={{ fontSize: '1.3rem' }}
                  tracks={openArtistTracksQuery.data}
                />
                <HighlightAlbum
                  artistData={openArtistQuery.data}
                  library={library}
                  navigate={navigate}
                  width={width}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

export default ArtistsRow;
