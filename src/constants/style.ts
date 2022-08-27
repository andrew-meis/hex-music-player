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

export const sliderStyle = {
  color: 'background.grey',
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
