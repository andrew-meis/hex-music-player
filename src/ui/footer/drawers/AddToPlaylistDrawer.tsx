import { Drawer } from '@mui/material';
import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Album, Artist, Track } from 'api/index';
import AddToPlaylist from 'ui/sidebars/add-to-playlist/AddToPlaylist';

export const addToPlaylistAtom = atom<Album[] | Artist[] | Track[] | null>(null);

const AddToPlaylistDrawer = () => {
  const [items, setItems] = useAtom(addToPlaylistAtom);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (items) {
      setOpen(true);
    }
  }, [items]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => setItems(null), 500);
    }
  }, [open, setItems]);

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
      open={open}
      transitionDuration={300}
      variant="persistent"
    >
      {!!items && (
        <AddToPlaylist items={items} setOpen={setOpen} />
      )}
    </Drawer>
  );
};

export default AddToPlaylistDrawer;
