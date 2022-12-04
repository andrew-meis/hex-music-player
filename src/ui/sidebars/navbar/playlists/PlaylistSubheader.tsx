import {
  Box, Collapse, InputAdornment, InputBase, ListSubheader, SvgIcon,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { parsePlaylistContainer } from 'hex-plex/dist/types/playlist';
import React, { useEffect, useState } from 'react';
import { RiSendPlaneLine, TiPlus } from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { useCreatePlaylist } from 'hooks/playlistHooks';
import useToast from 'hooks/useToast';

interface PlaylistSubheaderProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

const PlaylistSubheader = ({ show, setShow }: PlaylistSubheaderProps) => {
  const queryClient = useQueryClient();
  const createPlaylist = useCreatePlaylist();
  const navigate = useNavigate();
  const toast = useToast();
  const [title, setTitle] = useState('');

  useEffect(() => () => setTitle(''), [show]);

  const handleSubmit = async (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault();
    const response = await createPlaylist(title);
    if (response.status === 200) {
      const newPlaylist = parsePlaylistContainer(response.data);
      setShow(false);
      await queryClient.refetchQueries(['playlists']);
      navigate(`/playlists/${newPlaylist.playlists[0].id}`);
      toast({ type: 'success', text: 'Playlist created' });
    }
    if (response.status !== 200) {
      setShow(false);
      toast({ type: 'error', text: 'Failed to create playlist' });
    }
  };

  return (
    <>
      <ListSubheader
        sx={{
          lineHeight: '20px',
          fontSize: '0.75rem',
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
        }}
      >
        Playlists
        <Box
          sx={{ '&:hover': { color: 'primary.main', cursor: 'pointer' } }}
          title="Create playlist"
          onClick={() => setShow(!show)}
        >
          <TiPlus />
        </Box>
      </ListSubheader>
      <Collapse in={show}>
        <Box
          bgcolor="background.paper"
          borderRadius="4px"
          component="form"
          height="32px"
          marginX="14px"
          onSubmit={handleSubmit}
        >
          <InputBase
            fullWidth
            endAdornment={(
              <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={handleSubmit}>
                <SvgIcon sx={{
                  mr: '12px',
                  color: 'text.secondary',
                  height: '18px',
                  width: '18px',
                  transform: 'rotate(45deg)',
                }}
                >
                  <RiSendPlaneLine />
                </SvgIcon>
              </InputAdornment>
            )}
            inputProps={{ style: { padding: '4px 8px 4px' }, spellCheck: false }}
            placeholder="Playlist title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>
      </Collapse>
    </>
  );
};

export default PlaylistSubheader;
