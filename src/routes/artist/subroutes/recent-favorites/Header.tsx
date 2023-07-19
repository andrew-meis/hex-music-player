import {
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Fade,
  SvgIcon,
  Typography,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { IoMdMicrophone } from 'react-icons/io';
import { MdDateRange } from 'react-icons/md';
import { RxCheck } from 'react-icons/rx';
import { useInView } from 'react-intersection-observer';
import { NavLink, useOutletContext } from 'react-router-dom';
import { Artist, Track } from 'api/index';
import { ChipFilter, ChipSelect } from 'components/chips';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import SelectTooltip from 'components/tooltip/SelectTooltip';
import { VIEW_PADDING, WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import FixedHeader from './FixedHeader';

const Header: React.FC<{
  artist: Artist,
  days: number,
  filter: string,
  handlePlayNow: (key?: string, shuffle?: boolean, sortedItems?: Track[]) => Promise<void>,
  setDays: React.Dispatch<React.SetStateAction<number>>,
  setFilter: React.Dispatch<React.SetStateAction<string>>,
}> = ({
  artist,
  days,
  filter,
  handlePlayNow,
  setDays,
  setFilter,
}) => {
  const chipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [thumbSrcSm] = useThumbnail(artist.thumb || 'none', 100);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });
  const { width } = useOutletContext() as { width: number };

  const maxWidth = 900;
  const tooltipMaxWidth = Math.min(maxWidth, width - VIEW_PADDING)
    - 20 // x-padding + tooltip offset
    - (chipRef.current?.clientWidth || 0);

  const options = [14, 30, 90, 180, 365];

  const handlePlay = () => handlePlayNow();
  const handleShuffle = () => handlePlayNow(undefined, true);

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          maxWidth="1600px"
          position="fixed"
          width={1}
          zIndex={400}
        >
          <FixedHeader
            artist={artist}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            thumbSrcSm={thumbSrcSm}
          />
        </Box>
      </Fade>
      <Box
        mx="auto"
        ref={ref}
        width={WIDTH_CALC}
      >
        <Box
          alignItems="center"
          bgcolor="background.paper"
          color="text.primary"
          display="flex"
          height={70}
          marginX="auto"
          maxWidth="1600px"
          paddingX="6px"
        >
          <Avatar
            alt={artist.title}
            src={artist.thumb ? thumbSrcSm : ''}
            sx={{ width: 60, height: 60 }}
          >
            <SvgIcon
              className="generic-icon"
              sx={{ color: 'common.black' }}
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
            &nbsp;&nbsp;»&nbsp;&nbsp;Recent Favorites
          </Typography>
          <PlayShuffleButton
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
          />
        </Box>
        <Box
          alignItems="center"
          display="flex"
          height={72}
          justifyContent="space-between"
          paddingX="6px"
        >
          <ChipFilter
            filter={filter}
            setFilter={setFilter}
          />
          <SelectTooltip
            maxWidth={tooltipMaxWidth}
            open={open}
            placement="left"
            title={(
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <ChipSelect maxWidth={tooltipMaxWidth}>
                  {options.map((option) => {
                    if (days === option) {
                      return (
                        <Chip
                          color="default"
                          key={option}
                          label={(
                            <Box alignItems="center" display="flex">
                              {`Last ${option} days`}
                              <SvgIcon viewBox="0 0 16 24">
                                <RxCheck />
                              </SvgIcon>
                            </Box>
                          )}
                          sx={{ fontSize: '0.9rem' }}
                          onClick={() => {
                            setOpen(false);
                            setDays(option);
                          }}
                        />
                      );
                    }
                    return null;
                  })}
                  <Box bgcolor="border.main" flexShrink={0} height={32} width="1px" />
                  {options.map((option) => {
                    if (days === option) return null;
                    return (
                      <Chip
                        color="default"
                        key={option}
                        label={(
                          <Box alignItems="center" display="flex">
                            {`Last ${option} days`}
                          </Box>
                        )}
                        sx={{ fontSize: '0.9rem' }}
                        onClick={() => {
                          setOpen(false);
                          setDays(option);
                        }}
                      />
                    );
                  })}
                </ChipSelect>
              </ClickAwayListener>
            )}
          >
            <Chip
              color="primary"
              label={(
                <Box alignItems="center" display="flex">
                  {`Last ${days} days`}
                  <SvgIcon sx={{ height: '18px', ml: '8px', width: '18px' }} viewBox="0 1 24 24">
                    <MdDateRange />
                  </SvgIcon>
                </Box>
              )}
              ref={chipRef}
              sx={{ fontSize: '0.9rem' }}
              onClick={() => setOpen(true)}
            />
          </SelectTooltip>
        </Box>
      </Box>
    </>
  );
};

export default Header;
