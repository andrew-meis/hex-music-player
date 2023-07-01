import { Avatar, SvgIcon } from '@mui/material';
import { MenuItem } from '@szhsin/react-menu';
import { IoMdMicrophone } from 'react-icons/io';
import { useThumbnail } from 'hooks/plexHooks';

interface ArtistMenuItemProps {
  thumb: string;
  title: string;
  onClick: () => void;
}

const ArtistMenuItem = ({ thumb, title, onClick }: ArtistMenuItemProps) => {
  const [thumbSrc] = useThumbnail(thumb, 100);
  return (
    <MenuItem onClick={onClick}>
      <Avatar
        alt={title}
        src={thumb ? thumbSrc : undefined}
        sx={{
          height: 24,
          mr: '8px',
          width: 24,
        }}
      >
        <SvgIcon sx={{ height: 18, width: 18 }}>
          <IoMdMicrophone />
        </SvgIcon>
      </Avatar>
      <span>
        {title}
      </span>
    </MenuItem>
  );
};

export default ArtistMenuItem;
