import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { FaTags } from 'react-icons/fa';
import { ChipFilter } from 'components/chips';
import { WIDTH_CALC_PADDING } from 'constants/measures';

const Header: React.FC<{
  filter: string
  setFilter: React.Dispatch<React.SetStateAction<string>>,
  title: string,
}> = ({ filter, setFilter, title }) => (
  <Box
    alignItems="center"
    bgcolor="background.paper"
    color="text.primary"
    display="flex"
    height={70}
    marginX="auto"
    maxWidth="1588px"
    paddingX="6px"
    width={WIDTH_CALC_PADDING}
  >
    <Avatar
      alt="Genre"
      sx={{
        background: `linear-gradient(
          to bottom right,
          var(--mui-palette-primary-main),
          rgba(var(--mui-palette-primary-mainChannel) / 0.60))`,
        width: 60,
        height: 60,
      }}
      variant="rounded"
    >
      <SvgIcon sx={{ height: 40, width: 40 }}>
        <FaTags />
      </SvgIcon>
    </Avatar>
    <Typography
      alignSelf="center"
      ml="10px"
      variant="header"
      width={1}
    >
      {title}
    </Typography>
    <ChipFilter
      filter={filter}
      setFilter={setFilter}
    />
  </Box>
);

export default Header;
