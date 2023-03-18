import { Box, Collapse, SvgIcon, Typography } from '@mui/material';
import { Artist } from 'hex-plex';
import React from 'react';
import { FaAngleDown, IoMdMicrophone } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { VIEW_PADDING, WIDTH_CALC } from 'constants/measures';
import styles from 'styles/MotionImage.module.scss';
import CollapseContent from './CollapseContent';
import { RowProps, SimilarArtistContext } from './SimilarArtists';

const textStyle = {
  bottom: '8px',
  color: 'text.primary',
  display: '-webkit-box',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  height: '20px',
  lineHeight: 1.2,
  marginLeft: '12px',
  overflow: 'hidden',
  position: 'absolute',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  width: 'calc(100% - 24px)',
  wordBreak: 'break-all',
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
  const imgHeight = Math.floor(((width - VIEW_PADDING) / grid.cols) * 0.70);
  const imgWidth = Math.floor((width - VIEW_PADDING) / grid.cols);
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
    <MotionBox
      className={styles.container}
      data-id={artist.id}
      height={imgHeight + 28}
      key={artist.id}
      sx={{
        backgroundColor: open ? 'var(--mui-palette-action-selected)' : '',
        borderRadius: '32px',
        contain: 'paint',
        '&:hover': {
          backgroundColor: open ? 'var(--mui-palette-action-selected)' : '',
        },
      }}
      whileHover="hover"
      width={imgWidth}
      onClick={handleClick}
    >
      <MotionBox
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={imgHeight - 24}
        margin="12px"
        style={{
          borderRadius: '32px',
          transition: '0.2s',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={open ? {} : imageMotion}
        width={imgWidth - 24}
      >
        {!artist.thumb && (
          <SvgIcon
            className="generic-icon"
            sx={{ color: 'common.grey' }}
          >
            <IoMdMicrophone />
          </SvgIcon>
        )}
      </MotionBox>
      <Typography
        sx={{
          ...textStyle,
          textAlign: 'center',
          transition: '200ms',
        }}
      >
        <Link
          className="link"
          state={{
            guid: artist.guid,
            title: artist.title,
          }}
          to={`/artists/${artist.id}`}
        >
          {artist.title}
        </Link>
      </Typography>
      <SvgIcon
        className={open ? styles.open : ''}
        sx={{
          bottom: '38px',
          color: 'common.white',
          filter: 'drop-shadow(0px 0px 1px rgb(0 0 0 / 0.8))',
          position: 'absolute',
          width: '100%',
        }}
        viewBox="1 0 24 24"
      >
        <FaAngleDown />
      </SvgIcon>
    </MotionBox>
  );
};

const getCaretPos = (cols: number, openIndex: number, width: number) => {
  const colWidth = Math.floor((width - VIEW_PADDING) / cols);
  return (colWidth * openIndex) + (colWidth / 2);
};

const Row = React.memo(({ index: rowIndex, context }: RowProps) => {
  const {
    grid,
    items: { rows },
    open,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    setOpen,
    setOpenArtist,
    virtuoso,
    width,
  } = context;
  const { artists } = rows![rowIndex];

  const openIndex = openCard.index;
  const caretPos = getCaretPos(grid.cols, openIndex, width);

  const handleEntered = () => {
    virtuoso.current?.scrollToIndex({ index: rowIndex, behavior: 'smooth' });
    if (openArtist.id === artists[openIndex].id) {
      setOpenArtist({
        id: -1,
        guid: '',
        title: '',
      });
      setOpen(true);
      return;
    }
    setOpenArtist({
      id: artists[openIndex].id,
      guid: artists[openIndex].guid,
      title: artists[openIndex].title,
    });
    setOpen(true);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        mx="auto"
        width={WIDTH_CALC}
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
        onExit={() => setOpen(false)}
      >
        <Box
          bgcolor="common.contrastGrey"
          borderBottom="1px solid var(--mui-palette-action-hover)"
          borderRadius="12px"
          borderTop="1px solid var(--mui-palette-action-hover)"
          height={332}
          margin="auto"
          marginY="8px"
          sx={{
            transform: 'translateZ(0px)',
          }}
          width={WIDTH_CALC}
        >
          <Box
            bgcolor="common.contrastGrey"
            height={18}
            position="absolute"
            sx={{
              borderLeft: '1px solid var(--mui-palette-action-hover)',
              borderTop: '1px solid var(--mui-palette-action-hover)',
              left: caretPos,
              overflow: 'hidden',
              top: '-14px',
              transform: 'rotate(45deg)',
              transformOrigin: 'top left',
            }}
            width={18}
          />
          {openArtist && open && openArtistQuery.data && openArtistTracksQuery.data && (
            <CollapseContent context={context} />
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

export default Row;
