import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { IoMdMicrophone } from 'react-icons/io';
import { Track } from 'api/index';

interface FixedHeaderProps {
  thumbSrcSm: string;
  track: Track;
}

const FixedHeader = ({ thumbSrcSm, track }: FixedHeaderProps) => (
  <Box
    alignItems="center"
    bgcolor="background.paper"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.primary"
    display="flex"
    height={70}
    marginX="auto"
    maxWidth="900px"
    paddingX="6px"
    width="calc(100% - 12px)"
  >
    <Avatar
      alt={track.title}
      src={track.thumb ? thumbSrcSm : ''}
      sx={{ width: 60, height: 60 }}
      variant="rounded"
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
      {track.grandparentTitle}
      &nbsp;&nbsp;»&nbsp;&nbsp;
      {track.title}
    </Typography>
  </Box>
);

export default FixedHeader;
