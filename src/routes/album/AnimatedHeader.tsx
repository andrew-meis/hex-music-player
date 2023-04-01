import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import chroma from 'chroma-js';
import fontColorContrast from 'font-color-contrast';
import React from 'react';
import { BiHash, RiHeartLine, RiTimeLine } from 'react-icons/all';
import { Link, NavigateFunction } from 'react-router-dom';
import { Album } from 'api/index';
import {
  MotionAvatar,
  MotionBox,
  MotionTypography,
} from 'components/motion-components/motion-components';
import Palette from 'components/palette/Palette';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import usePlayback from 'hooks/usePlayback';

interface GenreLinksProps {
  album: Album;
}

const GenreLinks = ({ album }: GenreLinksProps) => (
  <Box
    display="flex"
    flexWrap="wrap"
    height={22}
    mt="4px"
    overflow="hidden"
  >
    <Typography fontFamily="Rubik" variant="subtitle2">
      {album.year}
    </Typography>
    {album.genre.map((genre) => (
      <Typography
        fontFamily="Rubik"
        key={genre.id}
        sx={{
          pointerEvents: 'auto',
        }}
        variant="subtitle2"
        onWheel={(e) => {
          const target = e.currentTarget as unknown as HTMLDivElement;
          target.style.pointerEvents = 'none';
          setTimeout(() => { target.style.pointerEvents = 'auto'; }, 10);
        }}
      >
        <>
          &nbsp;·&nbsp;
          <Link
            className="link"
            state={{ title: genre.tag }}
            to={`/genres/${genre.id}`}
          >
            {genre.tag.toLowerCase()}
          </Link>
        </>
      </Typography>
    ))}
  </Box>
);

interface AnimatedHeaderProps {
  album: Album;
  navigate: NavigateFunction;
  shrink: boolean;
}

const AnimatedHeader = ({ album, navigate, shrink }: AnimatedHeaderProps) => {
  const [parentThumbSrc] = useThumbnail(album.parentThumb || 'none', 100);
  const [thumbSrc, thumbUrl] = useThumbnail(album.thumb || 'none', 400);
  const { playAlbum } = usePlayback();

  const handlePlay = () => playAlbum(album as Album);
  const handleShuffle = () => playAlbum(album as Album, true);

  return (
    <MotionBox
      layout
      bgcolor="background.paper"
      display="flex"
      flexDirection="column"
      height={shrink ? 100 : 300}
      id="list-header"
      left={0}
      maxWidth="900px"
      mx="auto"
      overflow="hidden"
      position="fixed"
      right={0}
      top={0}
      transition={{ duration: 0.3 }}
      width={WIDTH_CALC}
      zIndex={2}
      onWheel={(e) => {
        const target = e.currentTarget as unknown as HTMLDivElement;
        target.style.pointerEvents = 'none';
        setTimeout(() => { target.style.pointerEvents = 'auto'; }, 10);
      }}
    >
      <Box alignItems="flex-end" color="text.primary" display="flex" width={1}>
        <MotionAvatar
          layout
          alt={album.title}
          src={thumbSrc}
          sx={{
            height: shrink ? 82 : 254,
            margin: '8px',
            ml: 0,
            width: shrink ? 82 : 254,
          }}
          variant="rounded"
        />
        <MotionBox
          layout
          alignItems={shrink ? 'center' : 'flex-end'}
          display="flex"
          flexGrow={1}
          height="calc(100% - 20px)"
          my="10px"
        >
          <MotionBox
            layout
            display="flex"
            flexDirection="column"
            flexGrow={1}
            width="auto"
          >
            {!shrink && (
              <MotionBox
                animate={{ opacity: 1 }}
                height={18}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {[...album.format, ...album.subformat].map((item, index, { length }) => {
                  if (length - 1 === index) {
                    return (
                      <Typography key={item.id} variant="subtitle2">
                        {item.tag.toLowerCase()}
                      </Typography>
                    );
                  }
                  return (
                    <Typography key={item.id} variant="subtitle2">
                      {item.tag.toLowerCase()}
                      {' ·'}
                      &nbsp;
                    </Typography>
                  );
                })}
              </MotionBox>
            )}
            <MotionTypography
              alignSelf="center"
              layout="position"
              variant={shrink ? 'header' : 'title'}
              width={1}
            >
              {album.title}
            </MotionTypography>
            {!shrink && (
              <MotionBox
                alignItems="center"
                animate={{ opacity: 1 }}
                display="flex"
                height={36}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Palette id={album.thumb} url={thumbUrl}>
                  {({ data: colors, isLoading }) => {
                    if (isLoading) {
                      return null;
                    }
                    return (
                      <Box
                        alignItems="center"
                        borderRadius="16px"
                        display="flex"
                        height="36px"
                        sx={{
                          background: !colors
                            ? 'active.selected'
                            : chroma(colors.muted).saturate(2).brighten(1).hex(),
                          cursor: 'pointer',
                          transition: 'box-shadow 200ms ease-in',
                          '&:hover': { boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.3)' },
                        }}
                        onClick={() => navigate(
                          `/artists/${album.parentId}`,
                          { state: { guid: album.parentGuid, title: album.parentTitle } },
                        )}
                      >
                        <Avatar
                          alt={album.parentTitle}
                          src={parentThumbSrc}
                          sx={{ width: '32px', height: '32px', ml: '2px' }}
                        />
                        <Typography
                          color={!colors
                            ? 'text.main'
                            : fontColorContrast(chroma(colors.muted).saturate(2).brighten(1).hex())}
                          fontSize="0.875rem"
                          ml="8px"
                          mr="12px"
                          whiteSpace="nowrap"
                        >
                          {album.parentTitle}
                        </Typography>
                      </Box>
                    );
                  }}
                </Palette>
              </MotionBox>
            )}
            {!shrink && (
              <GenreLinks album={album} />
            )}
          </MotionBox>
          <MotionBox layout>
            <PlayShuffleButton
              handlePlay={handlePlay}
              handleShuffle={handleShuffle}
            />
          </MotionBox>
        </MotionBox>
      </Box>
      <Box
        alignItems="flex-start"
        borderBottom="1px solid"
        borderColor="border.main"
        color="text.secondary"
        display="flex"
        height={shrink ? 1 : 30}
        overflow="hidden"
        width="100%"
      >
        <Box maxWidth="10px" width="10px" />
        <Box display="flex" flexShrink={0} justifyContent="center" width="40px">
          <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
            <BiHash />
          </SvgIcon>
        </Box>
        <Box sx={{ width: '56px' }} />
        <Box sx={{
          width: '50%', flexGrow: 1, display: 'flex', justifyContent: 'flex-end',
        }}
        >
          <span />
        </Box>
        <Box display="flex" flexShrink={0} justifyContent="flex-end" mx="5px" width="80px">
          <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
            <RiHeartLine />
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
        <Box maxWidth="10px" width="10px" />
      </Box>
    </MotionBox>
  );
};

export default React.memo(AnimatedHeader);
