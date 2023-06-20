import { Avatar, Box, Chip, ClickAwayListener, SvgIcon, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { IoMdMicrophone, RxCheck } from 'react-icons/all';
import { NavLink, useOutletContext } from 'react-router-dom';
import { ChipSelect } from 'components/chips';
import SelectTooltip from 'components/tooltip/SelectTooltip';
import { VIEW_PADDING, WIDTH_CALC_PADDING } from 'constants/measures';
import { DiscographyContext } from './Discography';

const Header = ({ context }: { context?: DiscographyContext }) => {
  const { width } = useOutletContext() as { width: number };
  const {
    artist: artistData, filter, filters, library, setFilter,
  } = context!;
  const { artist } = artistData!;
  const chipRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const thumbSrc = library.api
    .getAuthenticatedUrl(
      '/photo/:/transcode',
      { url: artist.thumb || 'null', width: 100, height: 100 },
    );

  const maxWidth = 900;
  const tooltipMaxWidth = Math.min(maxWidth, width - VIEW_PADDING)
    - 20 // x-padding + tooltip offset
    - (chipRef.current?.clientWidth || 0);

  return (
    <Box
      height={71}
      position="fixed"
      top={0}
      width={width}
      zIndex={400}
    >
      <Box
        alignItems="center"
        bgcolor="background.paper"
        color="text.primary"
        display="flex"
        height={71}
        marginX="auto"
        maxWidth="900px"
        paddingX="6px"
        width={WIDTH_CALC_PADDING}
      >
        <Avatar
          alt={artist.title}
          src={artist.thumb ? thumbSrc : ''}
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
          &nbsp;&nbsp;»&nbsp;&nbsp;Discography
        </Typography>
        <SelectTooltip
          maxWidth={tooltipMaxWidth}
          open={open}
          placement="left"
          title={(
            <ClickAwayListener onClickAway={() => setOpen(false)}>
              <ChipSelect leftScroll maxWidth={tooltipMaxWidth}>
                {filters.map((option) => (
                  <Chip
                    color="default"
                    key={option}
                    label={(
                      <Box alignItems="center" display="flex">
                        {option}
                        {filter === option && (
                          <SvgIcon viewBox="0 0 16 24">
                            <RxCheck />
                          </SvgIcon>
                        )}
                      </Box>
                    )}
                    sx={{ fontSize: '0.9rem' }}
                    onClick={() => {
                      setOpen(false);
                      setFilter(option);
                    }}
                  />
                ))}
              </ChipSelect>
            </ClickAwayListener>
          )}
        >
          <Chip
            color="primary"
            label={(
              <Box alignItems="center" display="flex">
                {filter}
                <SvgIcon viewBox="0 0 16 24">
                  <RxCheck />
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
  );
};

Header.defaultProps = {
  context: undefined,
};

export default Header;
