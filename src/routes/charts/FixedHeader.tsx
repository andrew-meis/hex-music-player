import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { Moment } from 'moment';
import { TiChartLine } from 'react-icons/ti';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC_PADDING } from 'constants/measures';

interface FixedHeaderProps {
  days: number;
  start: Moment;
  end: Moment;
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
}

const FixedHeader = ({ days, end, handlePlay, handleShuffle, start }: FixedHeaderProps) => (
  <Box
    alignItems="center"
    bgcolor="background.paper"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.primary"
    display="flex"
    height={70}
    marginX="auto"
    maxWidth="888px"
    paddingX="6px"
    width={WIDTH_CALC_PADDING}
  >
    <Avatar
      alt="Chart"
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
        <TiChartLine />
      </SvgIcon>
    </Avatar>
    <Typography
      alignSelf="center"
      ml="10px"
      variant="header"
      width={1}
    >
      Top Tracks&nbsp;&nbsp;»&nbsp;&nbsp;
      {days !== 0 && `Last ${days} days`}
      {days === 0 && (
        <span>
          {start.format('DD MMMM YYYY')}
          &nbsp;&nbsp;–&nbsp;&nbsp;
          {end.format('DD MMMM YYYY')}
        </span>
      )}
    </Typography>
    <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
  </Box>
);

export default FixedHeader;
