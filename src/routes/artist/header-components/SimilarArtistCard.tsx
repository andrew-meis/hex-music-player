import { Avatar, Box, SvgIcon } from '@mui/material';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { IoMdMicrophone } from 'react-icons/io';
import { NavigateFunction } from 'react-router-dom';
import { Artist, Library } from 'api/index';
import { Title, Subtitle } from 'components/typography/TitleSubtitle';
import { DragTypes } from 'types/enums';

const SimilarArtistCard: React.FC<{
  cardWidth: number,
  cols: number,
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  index: number,
  library: Library,
  menuTarget: Artist[],
  navigate: NavigateFunction,
  similarArtist: Artist,
}> = ({
  cardWidth,
  cols,
  handleContextMenu,
  index,
  library,
  menuTarget,
  navigate,
  similarArtist,
}) => {
  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id)
    .includes(similarArtist.id);
  const thumbSrc = library.api
    .getAuthenticatedUrl(
      '/photo/:/transcode',
      { url: similarArtist.thumb, width: 100, height: 100 },
    );

  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.ARTIST,
    item: () => [similarArtist],
  }), [similarArtist]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, similarArtist]);

  return (
    <Box
      alignItems="center"
      borderRadius="12px"
      data-id={similarArtist.id}
      display="flex"
      height={70}
      key={similarArtist.id}
      ref={drag}
      sx={{
        backgroundColor: menuOpen ? 'var(--mui-palette-action-hover)' : 'transparent',
        cursor: 'pointer',
        marginRight: (index + 1) % (cols - 1) === 0 ? '0px' : '8px',
        transition: '0.2s',
        '& > div.MuiAvatar-root': {
          transition: '0.2s',
          filter: menuOpen ? 'none' : 'grayscale(60%)',
        },
        '&:hover': {
          backgroundColor: 'action.hover',
          '& > div.MuiAvatar-root': {
            filter: 'none',
          },
        },
      }}
      width={cardWidth - (78 / (cols - 1)) - (8 / ((cols - 1) / (cols - 2)))}
      onClick={() => navigate(
        `/artists/${similarArtist.id}`,
        { state: { guid: similarArtist.guid, title: similarArtist.title } },
      )}
      onContextMenu={handleContextMenu}
    >
      <Avatar
        alt={similarArtist.title}
        src={similarArtist.thumb ? thumbSrc : ''}
        sx={{
          height: 60,
          marginLeft: '8px',
          width: 60,
        }}
      >
        <SvgIcon className="generic-icon" sx={{ color: 'common.black' }}>
          <IoMdMicrophone />
        </SvgIcon>
      </Avatar>
      <Box>
        <Title marginTop="2px" marginX="8px">
          {similarArtist.title}
        </Title>
        <Subtitle
          marginX="8px"
        >
          {similarArtist.genre.slice(0, 2).map(
            (genre, i, a) => `${genre.tag.toLowerCase()}${i !== a.length - 1 ? ', ' : ''}`,
          )}
        </Subtitle>
      </Box>
    </Box>
  );
};

export default SimilarArtistCard;
