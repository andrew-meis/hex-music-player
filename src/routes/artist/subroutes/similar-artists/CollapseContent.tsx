import { Box, Typography, SvgIcon } from '@mui/material';
import { BiChevronRight } from 'react-icons/all';
import { BsListUl, BsGrid } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import TrackHighlights from 'routes/artist/TrackHighlights';
import AlbumHighlights from './AlbumHighlights';
import { SimilarArtistContext } from './SimilarArtists';

const iconStyle = {
  color: 'text.secondary',
  height: '0.9em',
  marginRight: '8px',
  width: '0.9em',
};

interface CollapseContentProps {
  context: SimilarArtistContext;
  panelHeight: number;
}

const CollapseContent = ({ context, panelHeight }: CollapseContentProps) => {
  const {
    grid,
    library,
    navigate,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    panelContent,
    setPanelContent,
    width,
  } = context;

  return (
    <Box
      margin="auto"
      width="calc(100% - 36px)"
    >
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        pt="6px"
      >
        <MotionTypography
          color="text.primary"
          fontFamily="TT Commons"
          fontSize="1.625rem"
          marginRight="auto"
          whileHover="hover"
          width="fit-content"
        >
          <Link
            className="link"
            state={{
              guid: openArtistQuery.data!.artist.guid,
              title: openArtistQuery.data!.artist.title,
            }}
            to={`/artists/${openArtist.id}`}
          >
            {openArtistQuery.data!.artist.title}
            <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
              <BiChevronRight />
            </MotionSvg>
          </Link>
        </MotionTypography>
        <SvgIcon
          sx={{
            ...iconStyle,
            color: panelContent === 'tracks' ? 'primary.main' : 'text.secondary',
            '&:hover': {
              color: panelContent === 'tracks' ? 'primary.main' : 'text.primary',
            },
          }}
          viewBox="0 -1 24 24"
          onClick={() => setPanelContent('tracks')}
        >
          <BsListUl />
        </SvgIcon>
        <SvgIcon
          sx={{
            ...iconStyle,
            color: panelContent === 'albums' ? 'primary.main' : 'text.secondary',
            '&:hover': {
              color: panelContent === 'albums' ? 'primary.main' : 'text.primary',
            },
          }}
          onClick={() => setPanelContent('albums')}
        >
          <BsGrid />
        </SvgIcon>
      </Box>
      <Typography color="text.primary" fontFamily="TT Commons" fontSize="1.3rem">
        {panelContent === 'tracks' ? 'Top Tracks' : 'Top Albums'}
      </Typography>
      <Box display="flex">
        {panelContent === 'tracks' && (
          <TrackHighlights
            context={context}
            tracks={openArtistTracksQuery.data!
              .slice(0, Math.floor((panelHeight - 85) / 56))}
          />
        )}
        {panelContent === 'albums' && (
          <AlbumHighlights
            artistData={openArtistQuery.data}
            cols={grid.cols}
            library={library}
            navigate={navigate}
            width={width}
          />
        )}
      </Box>
    </Box>
  );
};

export default CollapseContent;
