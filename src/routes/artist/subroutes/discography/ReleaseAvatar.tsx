import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Library } from 'api/index';
import { MotionAvatar } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { DragTypes } from 'types/enums';
import { AlbumWithSection } from 'types/interfaces';

const ReleaseAvatar: React.FC<{
  index: number,
  isActiveRelease: boolean,
  library: Library,
  release: AlbumWithSection,
  setActiveRelease: (value: React.SetStateAction<AlbumWithSection | undefined>) => void,
}> = ({
  index,
  isActiveRelease,
  library,
  release,
  setActiveRelease,
}) => {
  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.ALBUM,
    item: () => [release],
  }), [release]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, release]);

  return (
    <Box ref={drag}>
      <MotionAvatar
        key={release.id}
        src={library.api.getAuthenticatedUrl(
          '/photo/:/transcode',
          {
            url: release.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
          },
        )}
        sx={{
          cursor: 'pointer',
          height: 152,
          mb: 1,
          ml: 1,
          mt: index === 0 ? 1 : 0,
          pointerEvents: isActiveRelease ? 'none' : '',
          width: 152,
        }}
        variant="rounded"
        variants={imageMotion}
        whileHover="hover"
        onClick={() => setActiveRelease(release)}
      />
    </Box>
  );
};

export default ReleaseAvatar;
