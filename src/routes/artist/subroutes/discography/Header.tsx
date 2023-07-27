import { Avatar, Box, Chip, ClickAwayListener, SvgIcon, Typography } from '@mui/material';
import { atom, useAtomValue } from 'jotai';
import React, { useRef, useState } from 'react';
import { IoMdMicrophone } from 'react-icons/io';
import { RxCheck } from 'react-icons/rx';
import { NavLink, useOutletContext } from 'react-router-dom';
import { Artist, Library } from 'api/index';
import { ChipSelect } from 'components/chips';
import SelectTooltip from 'components/tooltip/SelectTooltip';
import { VIEW_PADDING } from 'constants/measures';

export const headerTextAtom = atom('');

const Header: React.FC<{
  artist: Artist,
  filter: string,
  filters: string[],
  library: Library,
  setFilter: React.Dispatch<React.SetStateAction<string>>,
}> = ({
  artist,
  filter,
  filters,
  library,
  setFilter,
}) => {
  const chipRef = useRef<HTMLDivElement | null>(null);
  const headerText = useAtomValue(headerTextAtom);
  const [open, setOpen] = useState(false);
  const { width } = useOutletContext() as { width: number };

  const thumbSrc = library.api
    .getAuthenticatedUrl(
      '/photo/:/transcode',
      { url: artist.thumb || 'null', width: 100, height: 100 },
    );
  const tooltipMaxWidth = width - VIEW_PADDING
    - 20 // x-padding + tooltip offset
    - (chipRef.current?.clientWidth || 0);

  return (
    <Box
      alignItems="center"
      bgcolor="background.paper"
      borderBottom="1px solid var(--mui-palette-border-main)"
      color="text.primary"
      display="flex"
      height={71}
      marginX="auto"
      paddingX="6px"
      width={1}
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
        &nbsp;&nbsp;»&nbsp;&nbsp;
        {headerText || 'Discography'}
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
  );
};

export default Header;
