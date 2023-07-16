import { SvgIcon } from '@mui/material';
import React from 'react';

const iconSx = {
  color: 'text.secondary',
  cursor: 'pointer',
  height: 32,
  marginRight: 1,
  width: 24,
  '&:hover': {
    color: 'text.primary',
  },
};

const TableSettingsIcon = () => (
  <svg
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h24v24H0z" fill="none" stroke="none" />
    <path d="M12 21h-7a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7" />
    <path d="M4 10h16" />
    <path d="M10 4v16" />
    <path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M19.001 15.5v1.5" />
    <path d="M19.001 21v1.5" />
    <path d="M22.032 17.25l-1.299 .75" />
    <path d="M17.27 20l-1.3 .75" />
    <path d="M15.97 17.25l1.3 .75" />
    <path d="M20.733 20l1.3 .75" />
  </svg>
);

const TableSettings: React.FC<{
  openColumnDialog: () => void,
}> = ({ openColumnDialog }) => (
  <SvgIcon
    sx={iconSx}
    onClick={openColumnDialog}
  >
    <TableSettingsIcon />
  </SvgIcon>
);

export default TableSettings;
