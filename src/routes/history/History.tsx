import { Box, SvgIcon, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import moment from 'moment';
import React from 'react';
import { RiTimeLine } from 'react-icons/ri';
import { TiInfoLarge } from 'react-icons/ti';
import { useLocation, useParams } from 'react-router-dom';
import { ListProps, Virtuoso } from 'react-virtuoso';
import { WIDTH_CALC } from 'constants/measures';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useTrackHistory } from 'queries/track-queries';
import Footer from 'routes/virtuoso-components/Footer';
import { RouteParams } from 'types/interfaces';

const Header = () => (
  <Box
    alignItems="flex-start"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.secondary"
    display="flex"
    height={30}
    maxWidth={900}
    mx="auto"
    width={WIDTH_CALC}
  >
    <Box sx={{
      marginRight: 'auto', textAlign: 'right', flexShrink: 0,
    }}
    >
      <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
        <TiInfoLarge />
      </SvgIcon>
    </Box>
    <Box sx={{
      width: '50px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0,
    }}
    >
      <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
        <RiTimeLine />
      </SvgIcon>
    </Box>
  </Box>
);

const List = React
  .forwardRef((
    { style, children }: ListProps,
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <Box
      ref={listRef}
      style={style}
      sx={{ maxWidth: '900px', mx: 'auto', width: WIDTH_CALC }}
    >
      {children}
    </Box>
  ));

const History = () => {
  const config = useConfig();
  const library = useLibrary();
  const location = useLocation();
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const { data } = useTrackHistory({
    config: config.data,
    library,
    id: +id,
  });

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
      // onAnimationComplete={() => virtuoso.current
      //   ?.scrollTo({ top: initialScrollTop })}
    >
      <Virtuoso
        className="scroll-container"
        components={{
          Footer,
          Header,
          List,
        }}
        data={data}
        fixedItemHeight={40}
        // isScrolling={handleScrollState}
        itemContent={(index, item) => (
          <Box
            alignItems="center"
            borderRadius="4px"
            color="text.secondary"
            display="flex"
            height={40}
            justifyContent="space-between"
            paddingX={1}
            sx={{
              boxSizing: 'border-box',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            width={1}
          >
            <Typography>
              {`${item.grandparentTitle} · ${item.parentTitle} · ${item.title}`}
            </Typography>
            <Typography>
              {moment.utc(item.viewedAt * 1000).format('DD MMM YYYY')}
            </Typography>
          </Box>
        )}
        // ref={virtuoso}
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
        onScroll={(e) => {
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            `history-scroll ${id}`,
            target.scrollTop as unknown as string,
          );
        }}
      />
    </motion.div>
  );
};

export default History;
