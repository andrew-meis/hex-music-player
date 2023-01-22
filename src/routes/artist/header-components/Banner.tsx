import { Avatar, Box, Fade, SvgIcon, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import chroma from 'chroma-js';
import { sample } from 'lodash';
import React, { useMemo, useRef } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { IoMdMicrophone } from 'react-icons/all';
import { InViewHookResponse, useInView } from 'react-intersection-observer';
import { Textfit } from 'react-textfit';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { useThumbnail, useUploadArt } from 'hooks/plexHooks';
import styles from 'styles/ArtistHeader.module.scss';
import { IAppSettings } from 'types/interfaces';
import { ArtistContext } from '../Artist';
import FixedHeader from '../FixedHeader';
import { thresholds } from '../Header';

const getPosX = (settings: IAppSettings) => {
  let leftWidth = 300;
  let rightWidth = 0;
  if (settings.compactNav) {
    leftWidth = 52;
  }
  if (settings.compactQueue) {
    rightWidth = 52;
  }
  if (settings.dockedQueue) {
    rightWidth = 300;
  }
  return (leftWidth / 2) - (rightWidth / 2);
};

const scale = (inputY: number, yRange: number[], xRange: number[]) => {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const percent = (inputY - yMin) / (yMax - yMin);
  return percent * (xMax - xMin) + xMin;
};

interface BannerProps {
  context: ArtistContext;
  tracksInView: InViewHookResponse;
}

const Banner = ({ context, tracksInView }: BannerProps) => {
  const {
    artist: artistData, colors, filter, library,
    playArtist, playArtistRadio, refreshPage, settings, width,
  } = context!;
  const { artist } = artistData!;
  const bannerInView = useInView({ threshold: thresholds });
  const bannerResize = scale(bannerInView.entry?.intersectionRatio || 1, [0, 1], [0, 50]);
  const color = useRef(sample(colors));
  const greyColor = settings.colorMode === 'light' ? grey['400'] : grey['600'];
  const posX = useMemo(() => getPosX(settings), [settings]);
  const bannerSrc = artist.art ? library.api.getAuthenticatedUrl(artist.art) : undefined;
  const thumbSrc = artist.thumb ? library.api.getAuthenticatedUrl(artist.thumb) : undefined;
  const [thumbSrcSm] = useThumbnail(artist.thumb || 'none', 100);
  const { uploadArt } = useUploadArt();
  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept: { 'image/*': [] },
    noClick: true,
    onDrop: (files: FileWithPath[]) => {
      if (files.length === 0) {
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        uploadArt(artist.id, event.target!.result).then(() => refreshPage());
      });
      reader.readAsArrayBuffer(files[0]);
    },
  });
  const style = useMemo(() => ({
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: isDragAccept ? 'green' : 'transparent',
  }), [isDragAccept]);

  const handlePlay = () => playArtist(artist);
  const handleShuffle = () => playArtist(artist, true);
  const handleRadio = () => playArtistRadio(artist);

  return (
    <>
      <Fade
        in={!bannerInView.inView
          && ((bannerInView.entry ? bannerInView.entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          position="fixed"
          width={width}
          zIndex={400}
        >
          <FixedHeader
            artist={artist}
            handlePlay={handlePlay}
            handleRadio={handleRadio}
            handleShuffle={handleShuffle}
            headerText={tracksInView.inView ? 'Top Tracks' : filter}
            thumbSrcSm={thumbSrcSm}
          />
        </Box>
      </Fade>
      <Box
        alignItems="flex-end"
        display="flex"
        height="40vh"
        minHeight={390}
        ref={bannerInView.ref}
      >
        {artist.art
          && (
            <span
              className={styles['artist-banner']}
              style={{
                '--img': `url(${bannerSrc})`,
                '--color': chroma(color.current || greyColor).rgb(),
                '--alpha': 1 - (bannerInView.entry ? bannerInView.entry.intersectionRatio : 0),
                '--posX': `${posX}px`,
                '--grow': `${bannerResize}px`,
                '--width': width > 1600 ? '1600px' : `${width}px`,
              } as React.CSSProperties}
            />
          )}
        {!artist.art && !!artist.thumb
          && (
            <span
              className={styles['artist-banner']}
              style={{
                display: 'flex',
                '--color': chroma(color.current || greyColor).rgb(),
                '--alpha': 1 - (bannerInView.entry ? bannerInView.entry.intersectionRatio : 0) < 0.2
                  ? 0.2
                  : 1 - (bannerInView.entry ? bannerInView.entry.intersectionRatio : 0),
              } as React.CSSProperties}
            >
              <Box alignItems="center" display="flex" height={1} mx="auto" width="89%">
                <Avatar
                  alt={artist.title}
                  src={thumbSrc}
                  sx={{ width: 300, height: 300 }}
                />
              </Box>
            </span>
          )}
        {!artist.art && !artist.thumb
          && (
            <span
              className={styles['artist-banner']}
              style={{
                display: 'flex',
                '--color': chroma(color.current || greyColor).rgb(),
                '--alpha': 1 - (bannerInView.entry ? bannerInView.entry.intersectionRatio : 0) < 0.2
                  ? 0.2
                  : 1 - (bannerInView.entry ? bannerInView.entry.intersectionRatio : 0),
              } as React.CSSProperties}
            >
              <Box alignItems="center" display="flex" height={1} mx="auto" width="89%">
                <Avatar
                  alt={artist.title}
                  sx={{ width: 300, height: 300 }}
                >
                  <SvgIcon className="generic-artist" sx={{ height: '65%', width: '65%' }}>
                    <IoMdMicrophone />
                  </SvgIcon>
                </Avatar>
              </Box>
            </span>
          )}
        <Box position="absolute" width="80%">
          <Textfit max={72} min={24} mode="single">
            <Typography
              color="common.white"
              fontFamily="TT Commons"
              fontSize="inherit"
              fontWeight={700}
              marginBottom="8px"
              marginLeft="22px"
              sx={{ textShadow: '2px 4px 8px rgb(40 40 48 / 60%)' }}
              variant="h1"
            >
              {artist.title}
            </Typography>
          </Textfit>
        </Box>
        <Box
          marginBottom="12px"
          position="absolute"
          right="22px"
        >
          <PlayShuffleButton
            handlePlay={handlePlay}
            handleRadio={handleRadio}
            handleShuffle={handleShuffle}
          />
        </Box>
        <Box
          {...getRootProps({ className: 'dropzone', style })}
          height="calc(40vh - 4px)"
          minHeight={386}
          position="absolute"
          width="calc(100% - 4px)"
        >
          <input {...getInputProps()} />
        </Box>
      </Box>
    </>
  );
};

export default Banner;
