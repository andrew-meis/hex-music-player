import { Drawer } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Track } from 'hex-plex';
import AddToPlaylist from 'ui/sidebars/add-to-playlist/AddToPlaylist';

const AddToPlaylistDrawer = () => {
  const { data: tracks } = useQuery<Track[]>(
    ['playlist-dialog-open'],
    () => ([]),
    {
      initialData: [],
      staleTime: Infinity,
    },
  );

  return (
    <Drawer
      PaperProps={{
        square: false,
        sx: {
          backgroundColor: 'var(--mui-palette-background-default)',
          backgroundImage: 'var(--mui-palette-common-overlay)',
        },
      }}
      anchor="right"
      open={tracks.length > 0}
      transitionDuration={300}
      variant="persistent"
    >
      <AddToPlaylist tracks={tracks} />
    </Drawer>
  );
};

export default AddToPlaylistDrawer;
