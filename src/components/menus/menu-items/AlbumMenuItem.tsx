import { Avatar, SvgIcon } from '@mui/material';
import { MenuItem } from '@szhsin/react-menu';
import { RiAlbumFill } from 'react-icons/ri';
import { useThumbnail } from 'hooks/plexHooks';

interface AlbumMenuItemProps {
  thumb: string;
  title: string;
  onClick?: () => void;
}

const AlbumMenuItem = ({ thumb, title, onClick }: AlbumMenuItemProps) => {
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
        variant="rounded"
      >
        <SvgIcon sx={{ height: 18, width: 18 }}>
          <RiAlbumFill />
        </SvgIcon>
      </Avatar>
      <span>
        {title}
      </span>
    </MenuItem>
  );
};

AlbumMenuItem.defaultProps = {
  onClick: undefined,
};

export default AlbumMenuItem;
