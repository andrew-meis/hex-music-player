import {
  Avatar,
  Box,
  Button,
  Dialog,
  InputAdornment,
  InputBase,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Playlist, Track } from 'hex-plex';
import React, { useEffect, useState } from 'react';
import { GoCheck, RiSendPlaneLine, TbPlaylist } from 'react-icons/all';
import { Virtuoso } from 'react-virtuoso';
import { useAddToPlaylist, useCreatePlaylist } from 'hooks/playlistHooks';
import useToast from 'hooks/useToast';
import { useLibrary } from 'queries/app-queries';
import { QueryKeys } from 'types/enums';

const cartesian = (...a: any[]) => a
  .reduce((p, c) => p.flatMap((d: any) => c.map((e: any) => [d, e].flat())));

interface AddToPlaylistProps {
  playlists: Playlist[] | undefined;
}

const AddToPlaylist = ({ playlists }: AddToPlaylistProps) => {
  const addToPlaylist = useAddToPlaylist();
  const createPlaylist = useCreatePlaylist();
  const library = useLibrary();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selected, setSelected] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const { data: tracks, isLoading } = useQuery<Track[]>(
    ['playlist-dialog-open'],
    () => ([]),
    {
      initialData: [],
      staleTime: Infinity,
    },
  );

  useEffect(() => setSelected([]), [tracks]);

  const handleRowClick = (id: number) => {
    if (selected.includes(id)) {
      const newSelected = selected.filter((v) => v !== id);
      setSelected(newSelected);
      return;
    }
    const newSelected = [...selected, id];
    setSelected(newSelected);
  };

  const handleSave = () => {
    if (tracks.length === 0) {
      queryClient.setQueryData(['playlist-dialog-open'], []);
      return;
    }
    const keys = tracks.map((track) => track.key);
    const arrayForProcessing = cartesian(selected, keys);
    arrayForProcessing.forEach(async ([id, key]: [number, string]) => {
      await addToPlaylist(id, key);
    });
    queryClient.setQueryData(['playlist-dialog-open'], []);
  };

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault();
    const response = await createPlaylist(title);
    if (response.status === 200) {
      await queryClient.refetchQueries([QueryKeys.PLAYLISTS]);
      toast({ type: 'success', text: 'Playlist created' });
    }
    if (response.status !== 200) {
      toast({ type: 'error', text: 'Failed to create playlist' });
    }
    setTitle('');
  };

  if (isLoading) return null;

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={tracks.length > 0}
      sx={{
        zIndex: 2000,
      }}
      onClose={() => queryClient
        .setQueryData(['playlist-dialog-open'], [])}
    >
      <Box height="fit-content" paddingX="12px" paddingY="6px">
        <Typography color="text.primary" fontFamily="TT Commons" fontWeight={700} variant="h5">
          Select playlists:
        </Typography>
        <Virtuoso
          className="scroll-container"
          data={playlists?.filter((playlist) => playlist.smart !== true)}
          isScrolling={handleScrollState}
          itemContent={(index, playlist) => (
            <Box
              alignItems="center"
              borderRadius="4px"
              display="flex"
              height={56}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => handleRowClick(playlist.id)}
            >
              {selected.includes(playlist.id) && (
                <SvgIcon sx={{ ml: '10px' }}>
                  <GoCheck />
                </SvgIcon>
              )}
              <Avatar
                alt={playlist.title}
                src={playlist.thumb || playlist.composite
                  ? library.api.getAuthenticatedUrl(
                    '/photo/:/transcode',
                    {
                      url: playlist.thumb || playlist.composite,
                      width: 100,
                      height: 100,
                      minSize: 1,
                      upscale: 1,
                    },
                  )
                  : undefined}
                sx={{ mx: '10px' }}
                variant="rounded"
              >
                <SvgIcon>
                  <TbPlaylist />
                </SvgIcon>
              </Avatar>
              {playlist.title}
            </Box>
          )}
          style={{ height: 280 }}
        />
        <Box
          display="flex"
        >
          <Box
            bgcolor="background.paper"
            borderRadius="4px"
            component="form"
            height="32px"
            marginTop="8px"
            width={1}
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
              placeholder="Create playlist..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Box>
          <Button
            disableRipple
            color="error"
            size="small"
            sx={{
              fontSize: '0.95rem',
              height: 32,
              lineHeight: 1,
              marginLeft: '4px',
              marginTop: '8px',
              textTransform: 'none',
            }}
            variant="outlined"
            onClick={() => queryClient.setQueryData(['playlist-dialog-open'], [])}
          >
            Cancel
          </Button>
          <Button
            disableRipple
            color="success"
            size="small"
            sx={{
              fontSize: '0.95rem',
              height: 32,
              lineHeight: 1,
              marginLeft: '4px',
              marginTop: '8px',
              textTransform: 'none',
            }}
            variant="outlined"
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default AddToPlaylist;
