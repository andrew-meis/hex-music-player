import { Typography, TypographyProps } from '@mui/material';
import React from 'react';

const titleStyle = {
  color: 'text.primary',
  display: '-webkit-box',
  fontFamily: 'Rubik, sans-serif',
  fontSize: '1rem',
  lineHeight: 1.2,
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  wordBreak: 'break-all',
};

const subtitleStyle = {
  color: 'text.secondary',
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  wordBreak: 'break-all',
};

interface TitleProps extends TypographyProps {
  children: React.ReactNode;
}

export const Title = ({ children, ...props }: TitleProps) => (
  <Typography sx={titleStyle} {...props}>{children}</Typography>
);

interface SubtitleProps extends TypographyProps {
  children: React.ReactNode;
}

export const Subtitle = ({ children, ...props }: SubtitleProps) => (
  <Typography sx={subtitleStyle} variant="subtitle2" {...props}>{children}</Typography>
);
