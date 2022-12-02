import { Box } from '@mui/material';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { ArtistContext } from './Artist';
import Banner from './header-components/Banner';
import Highlights from './header-components/Highlights';
import InfoRow from './header-components/InfoRow';
import TopTracks from './TopTracks';

export const thresholds = Array.from(Array(101).keys()).map((n) => n / 100);

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ArtistContext }) => {
  const {
    artist: artistData, colors, library, navigate, width,
  } = context!;
  const tracksInView = useInView({ threshold: 0 });

  return (
    <>
      <Banner
        context={context}
        tracksInView={tracksInView}
      />
      <Box
        display="flex"
        flexWrap="wrap"
        mt="9px"
        mx="auto"
        ref={tracksInView.ref}
        width={(width * 0.89)}
      >
        <InfoRow
          artistData={artistData}
          colors={colors}
          library={library}
          navigate={navigate}
          width={width}
        />
        <TopTracks
          context={context}
          style={{ fontSize: '1.625rem', paddingTop: '6px' }}
          tracks={context!.topTracks}
        />
        <Highlights
          artistData={artistData}
          height={context!.topTracks!.length * 56}
          library={library}
          navigate={navigate}
          width={width}
        />
      </Box>
    </>
  );
};

export default React.memo(Header);
