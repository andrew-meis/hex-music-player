export const iconButtonStyle = {
  color: 'text.secondary',
  cursor: 'default',
  '&:hover': {
    backgroundColor: 'transparent',
    color: 'text.primary',
  },
  '&.Mui-disabled': {
    color: 'action.disabled',
  },
};

export const rowStyle = {
  borderRadius: '4px',
  color: 'text.secondary',
  '&:hover': {
    color: 'text.primary',
    backgroundColor: 'action.hover',
  },
};

export const selectBorderRadius = (selUp: boolean, selDown: boolean) => {
  if (selUp && selDown) {
    return '0';
  }
  if (selUp) {
    return '0 0 4px 4px';
  }
  if (selDown) {
    return '4px 4px 0 0';
  }
  return '4px';
};

export const selectedStyle = {
  ...rowStyle,
  backgroundColor: 'action.selected',
  color: 'text.primary',
  '&:hover': {
    backgroundColor: 'action.selected',
  },
};

export const sliderStyle = {
  color: 'common.grey',
  height: '4px',
  '& .MuiSlider-track': {
    border: 'none',
    transition: 'none',
  },
  '&:hover': {
    color: 'primary.main',
    '& .MuiSlider-thumb': {
      color: 'white',
      boxShadow:
        'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px !important',
      '&:hover': {
        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px !important',
      },
    },
  },
  '& .MuiSlider-thumbColorPrimary': {
    transition: 'none',
  },
};

export const typographyStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: 1.3,
};
