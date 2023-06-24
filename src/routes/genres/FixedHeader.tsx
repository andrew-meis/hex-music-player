import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { FaTags } from 'react-icons/fa';

interface FixedHeaderProps {
  width: number;
}

const FixedHeader = ({ width }: FixedHeaderProps) => (
  <Box
    alignItems="center"
    bgcolor="background.paper"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.primary"
    display="flex"
    height={70}
    marginX="auto"
    maxWidth="1588px"
    paddingX="6px"
    width={width - 6}
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
      Genres
    </Typography>
  </Box>
);

export default FixedHeader;
