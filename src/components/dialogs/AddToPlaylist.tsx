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
import { Library, Playlist, Track } from 'hex-plex';
import React, { useEffect, useState } from 'react';
import { GoCheck, RiSendPlaneLine } from 'react-icons/all';
import { ListProps, Virtuoso } from 'react-virtuoso';
import Subtext from 'components/subtext/Subtext';
import { typographyStyle } from 'constants/style';
import { useAddToPlaylist, useCreatePlaylist } from 'hooks/playlistHooks';
import useToast from 'hooks/useToast';
import { useLibrary } from 'queries/app-queries';
import { QueryKeys } from 'types/enums';

const List = React
  .forwardRef((
    // @ts-ignore
    { children, ...props }: ListProps,
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <Box
      className="list-box"
      ref={listRef}
      {...props}
    >
      {children}
    </Box>
  ));

const TracksToAdd = ({ library, tracks }: {library: Library, tracks: Track[]}) => {
  if (tracks.length === 0) {
    return (
      <Box height={56} />
    );
  }
  const [track] = tracks;
  return (
    <Box
      alignItems="center"
      display="flex"
      height={56}
    >
      <Avatar
        alt={track.title}
        src={
          library.api.getAuthenticatedUrl(
            '/photo/:/transcode',
            {
              url: track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
            },
          )
        }
        sx={{ width: 40, height: 40, marginX: '8px' }}
        variant="rounded"
      />
      <Box
        sx={{
          display: 'table',
          tableLayout: 'fixed',
          width: '100%',
        }}
      >
        <Typography
          color="text.primary"
          fontFamily="Rubik"
          fontSize="0.95rem"
          sx={{ ...typographyStyle }}
        >
          {track.title}
        </Typography>
        <Typography
          color="text.secondary"
          fontSize="0.875rem"
          sx={{ ...typographyStyle, pointerEvents: 'none' }}
        >
          <Subtext showAlbum track={track} />
        </Typography>
      </Box>
      {tracks.length > 1 && (
        <Box
          alignItems="center"
          bgcolor="action.selected"
          borderRadius="50%"
          display="flex"
          flexShrink={0}
          fontSize="1.3rem"
          height={40}
          justifyContent="center"
          width={40}
        >
          +
          {tracks.length - 1}
        </Box>
      )}
    </Box>
  );
};

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

  const handleSave = async () => {
    if (tracks.length === 0) {
      queryClient.setQueryData(['playlist-dialog-open'], []);
      return;
    }
    const trackIds = tracks.map((track) => track.id);
    selected.forEach(async (id) => {
      await addToPlaylist(id, trackIds);
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
          {`Add ${tracks.length > 1 ? 'tracks' : 'track'} to playlist:`}
        </Typography>
        <TracksToAdd
          library={library}
          tracks={tracks}
        />
        <Virtuoso
          className="scroll-container"
          components={{
            List,
          }}
          data={playlists?.filter((playlist) => playlist.smart !== true)}
          isScrolling={handleScrollState}
          itemContent={(index, playlist) => (
            <Box
              alignItems="center"
              borderRadius="4px"
              color={selected.includes(playlist.id) ? 'text.primary' : 'text.secondary'}
              display="flex"
              height={32}
              paddingX="10px"
              sx={{
                '&:hover': {
                  color: 'text.primary',
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => handleRowClick(playlist.id)}
            >
              {selected.includes(playlist.id) && (
                <SvgIcon sx={{ mr: '10px' }}>
                  <GoCheck />
                </SvgIcon>
              )}
              <Typography color="inherit">
                {playlist.title}
              </Typography>
            </Box>
          )}
          style={{ height: 288 }}
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
