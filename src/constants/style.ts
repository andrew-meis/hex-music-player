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

export const navlistActiveBox = (isActive: boolean) => ({
  width: '4px',
  height: '18px',
  marginLeft: isActive ? '4px' : '0px',
  marginRight: isActive ? '4px' : '0px',
  backgroundColor: isActive ? 'primary.main' : 'transparent',
  borderRadius: '2px',
});

export const navlistBoxStyle = {
  width: 'auto',
  py: 0,
  px: 0,
  mr: '10px',
  color: 'text.secondary',
  '&:hover': {
    color: 'text.primary',
  },
};

export const navlistTypeStyle = {
  WebkitLineClamp: 1,
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  fontSize: '0.92rem',
  py: '0px',
  lineHeight: '1.9rem',
  letterSpacing: '0.01rem',
};

export const navlistTypeActiveStyle = {
  ...navlistTypeStyle,
  color: 'text.primary',
  fontWeight: 700,
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

export const typographyStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: 1.3,
};
