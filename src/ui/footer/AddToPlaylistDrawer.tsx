import { Drawer } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Album, Track } from 'api/index';
import AddToPlaylist from 'ui/sidebars/add-to-playlist/AddToPlaylist';

type Item = Album | Track;

const AddToPlaylistDrawer = () => {
  const { data: items } = useQuery<Item[]>(
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
      open={items.length > 0}
      transitionDuration={300}
      variant="persistent"
    >
      <AddToPlaylist items={items} />
    </Drawer>
  );
};

export default AddToPlaylistDrawer;
