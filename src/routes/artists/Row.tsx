import { Box, Collapse, SvgIcon } from '@mui/material';
import { Artist } from 'hex-plex';
import React from 'react';
import { FaAngleDown, IoMdMicrophone } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import { VIEW_PADDING } from 'constants/measures';
import styles from 'styles/MotionImage.module.scss';
import { ArtistsContext, RowProps } from './Artists';
import CollapseContent from './CollapseContent';

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
        backgroundColor: open ? 'var(--mui-palette-action-selected)' : '',
        borderRadius: '32px',
        contain: 'paint',
        '&:hover': {
          backgroundColor: open ? 'var(--mui-palette-action-selected)' : '',
        },
      }}
      whileHover="hover"
      width={measurements.IMAGE_WIDTH}
      onClick={handleClick}
    >
      <MotionBox
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={measurements.IMAGE_HEIGHT - 24}
        margin="12px"
        style={{
          borderRadius: '32px',
          transition: '0.2s',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={open ? {} : imageMotion}
        width={measurements.IMAGE_WIDTH - 24}
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
      <Title marginX="12px" textAlign="center">
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
      </Title>
      <Subtitle
        marginX="12px"
        textAlign="center"
      >
        {artist.genre.slice(0, 2).map(
          (genre, i, a) => `${genre.tag.toLowerCase()}${i !== a.length - 1 ? ', ' : ''}`,
        )}
      </Subtitle>
      <SvgIcon
        className={open ? styles.open : ''}
        sx={{
          bottom: '-2px',
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

  const openIndex = openCard.index;
  const caretPos = getCaretPos(grid.cols, openIndex, width);

  const handleEntered = () => {
    virtuoso.current?.scrollTo({
      top: index * (measurements.ROW_HEIGHT + 8),
      behavior: 'smooth',
    });
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
        gap="8px"
        height={measurements.ROW_HEIGHT + 8}
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
          borderBottom="1px solid var(--mui-palette-action-hover)"
          borderRadius="32px"
          borderTop="1px solid var(--mui-palette-action-hover)"
          height={height < 639 ? 270 : 326}
          margin="auto"
          marginBottom="8px"
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
