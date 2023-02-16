import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { IoMdMicrophone } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import { WIDTH_CALC } from 'constants/measures';
import { SimilarArtistContext } from './SimilarArtists';

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: SimilarArtistContext }) => {
  const {
    artist: artistData, thumbSrc, width,
  } = context!;
  const { artist } = artistData!;
  const headerText = useQuery(
    ['similar-header-text'],
    () => '',
    {
      initialData: '',
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  return (
    <Box
      height={71}
      position="fixed"
      width={width}
      zIndex={400}
    >
      <Box
        alignItems="center"
        bgcolor="background.paper"
        borderBottom="1px solid"
        borderColor="border.main"
        color="text.primary"
        display="flex"
        height={70}
        marginX="auto"
        maxWidth="1600px"
        paddingX="6px"
        width={WIDTH_CALC}
      >
        <Avatar
          alt={artist.title}
          src={artist.thumb ? thumbSrc : ''}
          sx={{ width: 60, height: 60 }}
        >
          <SvgIcon
            className="generic-artist"
            sx={{ alignSelf: 'center', color: 'common.black', height: '65%', width: '65%' }}
          >
            <IoMdMicrophone />
          </SvgIcon>
        </Avatar>
        <Typography
          alignSelf="center"
          ml="10px"
          variant="header"
          width={1}
        >
          <NavLink
            className="link"
            state={{ guid: artist.guid, title: artist.title }}
            to={`/artists/${artist.id}`}
          >
            {artist.title}
          </NavLink>
          &nbsp;&nbsp;»&nbsp;&nbsp;
          {headerText.data}
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;
