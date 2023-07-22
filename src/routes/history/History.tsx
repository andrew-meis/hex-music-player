import { Box, SvgIcon, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import moment from 'moment';
import React, { useMemo, useRef, useState } from 'react';
import { RiTimeLine } from 'react-icons/ri';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { ListProps, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Track } from 'api/index';
import { TrackMenu } from 'components/menus';
import { WIDTH_CALC } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { useTrackHistory } from 'queries/track-queries';
import { configAtom, libraryAtom } from 'root/Root';
import Footer from 'routes/virtuoso-components/Footer';
import { RouteParams } from 'types/interfaces';

const Header = () => (
  <Box
    alignItems="flex-start"
    borderBottom="1px solid"
    borderColor="border.main"
    boxSizing="border-box"
    color="text.secondary"
    display="flex"
    height={30}
    maxWidth={900}
    mx="auto"
    paddingX={1}
    width={WIDTH_CALC}
  >
    <Box sx={{
      marginRight: 'auto', flexShrink: 0,
    }}
    >
      <Typography variant="overline">
        Title
      </Typography>
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
  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation();
  const menuTarget = useRef<Track[]>();
  const menuIndex = useRef<number>();
  const navigationType = useNavigationType();
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const { playSwitch } = usePlayback();
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const { data, isLoading } = useTrackHistory({
    config,
    library,
    id: +id,
  });

  const handleContextMenu = async (
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
    itemId: string,
  ) => {
    event.preventDefault();
    const { tracks } = (await library.track(parseInt(itemId, 10)));
    menuTarget.current = tracks;
    menuIndex.current = index;
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  };

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`history-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `history-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  if (!data || isLoading) {
    return null;
  }

  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        key={location.pathname}
        style={{ height: '100%' }}
        onAnimationComplete={() => virtuoso.current
          ?.scrollTo({ top: initialScrollTop })}
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
          isScrolling={handleScrollState}
          itemContent={(index, item) => (
            <Box
              alignItems="center"
              borderRadius="4px"
              boxSizing="border-box"
              display="flex"
              height={40}
              justifyContent="space-between"
              paddingX={1}
              sx={{
                backgroundColor: menuIndex.current === index
                  ? 'action.selected'
                  : '',
                color: menuIndex.current === index
                  ? 'text.primary'
                  : 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'text.primary',
                },
              }}
              width={1}
              onContextMenu={(e) => handleContextMenu(e, index, item.ratingKey)}
            >
              <Typography
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                }}
              >
                {`${item.grandparentTitle} · ${item.parentTitle} · ${item.title}`}
              </Typography>
              <Typography flexShrink={0} minWidth={180} textAlign="right">
                {moment.unix(item.viewedAt).format('DD MMM YYYY, h:mm a')}
              </Typography>
            </Box>
          )}
          ref={virtuoso}
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
      <TrackMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={menuTarget.current}
        onClose={() => {
          menuIndex.current = undefined;
          toggleMenu(false);
        }}
        {...menuProps}
      />
    </>
  );
};

export default History;
