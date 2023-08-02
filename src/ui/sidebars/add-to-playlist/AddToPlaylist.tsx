import {
  Avatar,
  Box,
  Button,
  InputAdornment,
  InputBase,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { RiSendPlaneLine } from 'react-icons/ri';
import { RxCheck } from 'react-icons/rx';
import { ListProps, Virtuoso } from 'react-virtuoso';
import { Album, Artist, Library, Track } from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { toastAtom } from 'components/toast/Toast';
import { typographyStyle } from 'constants/style';
import { useAddToPlaylist, useCreatePlaylist } from 'hooks/playlistHooks';
import { usePlaylists } from 'queries/playlist-queries';
import { libraryAtom, settingsAtom } from 'root/Root';
import { QueryKeys } from 'types/enums';
import { isAlbum, isArtist, isTrack } from 'types/type-guards';

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

const TracksToAdd: React.FC<{
  items: Album[] | Artist[] | Track[],
  library: Library,
}> = ({
  library,
  items,
}) => {
  const [item] = items;
  return (
    <Box
      alignItems="center"
      display="flex"
      height={56}
      width="calc(100% - 10px)"
    >
      <Avatar
        alt={item.title}
        src={
          library.api.getAuthenticatedUrl(
            '/photo/:/transcode',
            {
              url: item.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
            },
          )
        }
        sx={{ width: 40, height: 40, marginRight: '8px' }}
        variant={isArtist(item) ? 'circular' : 'rounded'}
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
          fontFamily="Rubik, sans-serif"
          fontSize="0.95rem"
          sx={{ ...typographyStyle }}
        >
          {item.title}
        </Typography>
        <Typography
          color="text.secondary"
          fontSize="0.875rem"
          sx={{ ...typographyStyle, pointerEvents: 'none' }}
        >
          {isAlbum(item) && item.parentTitle}
          {isTrack(item)
            // eslint-disable-next-line max-len
            && `${item.originalTitle ? item.originalTitle : item.grandparentTitle} — ${item.parentTitle}`}
        </Typography>
      </Box>
      {items.length > 1 && (
        <Box
          alignItems="center"
          bgcolor="action.hover"
          borderRadius="12px"
          display="flex"
          flexShrink={0}
          fontSize="1.3rem"
          height={40}
          justifyContent="center"
          width={40}
        >
          +
          {items.length - 1}
        </Box>
      )}
    </Box>
  );
};

const AddToPlaylist: React.FC<{
  items: Album[] | Artist[] | Track[],
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}> = ({
  items,
  setOpen,
}) => {
  const addToPlaylist = useAddToPlaylist();
  const createPlaylist = useCreatePlaylist();
  const library = useAtomValue(libraryAtom);
  const queryClient = useQueryClient();
  const settings = useAtomValue(settingsAtom);
  const setToast = useSetAtom(toastAtom);
  const [selected, setSelected] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const { data: playlists, isLoading } = usePlaylists(library);
  const { colorMode } = settings;

  useEffect(() => setSelected([]), [items]);

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
    const itemIds = items.map((item) => item.id);
    selected.forEach(async (id) => {
      await addToPlaylist(id, itemIds);
    });
    setOpen(false);
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
    if (response.size > 0) {
      await queryClient.refetchQueries([QueryKeys.PLAYLISTS]);
      setToast({ type: 'success', text: 'Playlist created' });
    }
    if (response.size === 0) {
      setToast({ type: 'error', text: 'Failed to create playlist' });
    }
    setTitle('');
  };

  if (isLoading) return null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={1}
      marginLeft="4px"
      overflow="hidden"
    >
      <Box
        alignItems="center"
        borderRadius="4px"
        color="text.primary"
        display="flex"
        justifyContent="flex-end"
        paddingY="8px"
        width={1}
      >
        <Typography fontSize="1.5rem" fontWeight={600} mr="8px">Add to Playlist</Typography>
      </Box>
      <Box height="-webkit-fill-available" width={1}>
        <TracksToAdd
          items={items}
          library={library}
        />
        <Box
          borderRadius="4px"
          component="form"
          height="32px"
          marginY="4px"
          sx={{
            backgroundColor: 'background.paper',
            backgroundImage: 'var(--mui-overlays-2)',
          }}
          width="calc(100% - 10px)"
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
                  <RxCheck />
                </SvgIcon>
              )}
              <Typography color="inherit">
                {playlist.title}
              </Typography>
            </Box>
          )}
          style={{ height: 'calc(100% - 152px)' }}
        />
        <Box
          alignItems="center"
          display="flex"
          height={40}
          justifyContent="flex-end"
          width="calc(100% - 10px)"
        >
          <MotionBox
            transition={{ type: 'spring', stiffness: 100 }}
            whileHover={{ scale: [null, 1.08, 1.04] }}
          >
            <Button
              color="error"
              size="small"
              sx={{
                borderRadius: '10px',
                color: colorMode === 'light' ? 'common.white' : '',
                fontSize: '0.95rem',
                ml: '4px',
                height: '32px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'var(--mui-palette-error-light)',
                },
              }}
              variant="contained"
              onClick={() => setOpen(false)}
            >
              <Box alignItems="center" display="flex" justifyContent="center" width={1}>
                Cancel
              </Box>
            </Button>
          </MotionBox>
          <MotionBox
            transition={{ type: 'spring', stiffness: 100 }}
            whileHover={{ scale: [null, 1.08, 1.04] }}
          >
            <Button
              color="success"
              size="small"
              sx={{
                borderRadius: '10px',
                color: colorMode === 'light' ? 'common.white' : '',
                fontSize: '0.95rem',
                ml: '4px',
                height: '32px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'var(--mui-palette-success-light)',
                },
              }}
              variant="contained"
              onClick={handleSave}
            >
              <Box alignItems="center" display="flex" justifyContent="center" width={1}>
                Save
              </Box>
            </Button>
          </MotionBox>
        </Box>
      </Box>
    </Box>
  );
};

export default AddToPlaylist;
