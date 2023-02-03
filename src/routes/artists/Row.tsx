import { Box, Collapse, SvgIcon, Typography } from '@mui/material';
import { Artist } from 'hex-plex';
import React from 'react';
import { FaAngleDown, IoMdMicrophone } from 'react-icons/all';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import styles from 'styles/MotionImage.module.scss';
import { ArtistsContext, RowProps } from './Artists';
import CollapseContent from './CollapseContent';

const textStyle = {
  bottom: '8px',
  color: 'text.primary',
  display: '-webkit-box',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  height: '20px',
  lineHeight: 1.2,
  overflow: 'hidden',
  position: 'absolute',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  wordBreak: 'break-all',
};

interface ArtistCardProps {
  artist: Artist;
  context: ArtistsContext;
  index: number;
  rowIndex: number;
}

const ArtistCard = ({ artist, context, index, rowIndex }: ArtistCardProps) => {
  const {
    library, measurements, openArtist, openCard, setOpenArtist, setOpenCard,
  } = context;
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
      height={measurements.ROW_HEIGHT}
      key={artist.id}
      sx={{
        contain: 'paint',
      }}
      whileHover="hover"
      width={measurements.IMAGE_WIDTH}
      onClick={handleClick}
    >
      <MotionBox
        animate={{ scale: open ? 1 : 0.95 }}
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={measurements.IMAGE_HEIGHT - 8}
        initial={{ scale: 0.95 }}
        margin="4px"
        style={{
          borderRadius: '32px',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={open ? {} : imageMotion}
        width={measurements.IMAGE_WIDTH - 8}
      >
        {!artist.thumb && (
          <SvgIcon
            className="generic-artist"
            sx={{
              alignSelf: 'center',
              color: 'common.grey',
              height: '65%',
              marginBottom: 'auto',
              marginTop: 'auto',
              width: '65%',
            }}
          >
            <IoMdMicrophone />
          </SvgIcon>
        )}
      </MotionBox>
      <Typography
        sx={{
          ...textStyle,
          opacity: open ? 0 : 1,
          textAlign: 'center',
          transition: '200ms',
          width: Math.floor((measurements.IMAGE_WIDTH - 16) * 0.95),
        }}
      >
        {artist.title}
      </Typography>
      <SvgIcon
        className={open ? styles.open : ''}
        sx={{
          bottom: '28px',
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
  const colWidth = Math.floor((width * 0.89) / cols);
  return (colWidth * openIndex) + (colWidth / 2);
};

const Row = React.memo(({ artists, context, index }: RowProps) => {
  const {
    grid,
    height,
    measurements,
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
  const panelHeight = height - 72 - measurements.ROW_HEIGHT - 12;

  const openIndex = openCard.index;
  const caretPos = getCaretPos(grid.cols, openIndex, width);

  const handleEntered = () => {
    virtuoso.current?.scrollTo({ top: index * measurements.ROW_HEIGHT, behavior: 'smooth' });
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
        width={measurements.ROW_WIDTH}
      >
        {artists.map((artist, colIndex) => (
          <ArtistCard
            artist={artist}
            context={context}
            index={colIndex}
            key={artist.id}
            rowIndex={index}
          />
        ))}
      </Box>
      <Collapse
        in={openCard.row === index}
        onEntered={handleEntered}
        onExit={() => setOpen(false)}
      >
        <Box
          bgcolor="common.contrastGrey"
          border="1px solid"
          borderColor="border.main"
          borderRadius="12px"
          height={panelHeight}
          margin="auto"
          maxHeight={380}
          sx={{
            transform: 'translateZ(0px)',
          }}
          width={measurements.ROW_WIDTH}
        >
          <Box
            bgcolor="common.contrastGrey"
            height={18}
            position="absolute"
            sx={{
              border: '1px solid transparent',
              borderTopColor: 'border.main',
              borderLeftColor: 'border.main',
              left: caretPos,
              overflow: 'hidden',
              top: '-14px',
              transform: 'rotate(45deg)',
              transformOrigin: 'top left',
            }}
            width={18}
          />
          {openArtist && open && openArtistQuery.data && openArtistTracksQuery.data && (
            <CollapseContent
              context={context}
              panelHeight={panelHeight}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

export default Row;
