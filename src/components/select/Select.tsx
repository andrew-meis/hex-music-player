import { Select as MuiSelect, SelectProps } from '@mui/material';

const Select = ({
  ...props
}: SelectProps) => (
  <MuiSelect
    disableUnderline
    MenuProps={{
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
      sx: {
        marginTop: '4px',
        '& .MuiList-root': {
          padding: 0,
        },
      },
      transformOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      marginThreshold: 0,
    }}
    SelectDisplayProps={{
      style: {
        paddingLeft: '6px',
      },
    }}
    inputProps={{
      sx: {
        backgroundColor: 'action.disabledBackground',
        borderRadius: '4px',
        '&:focus': {
          backgroundColor: 'action.disabledBackground',
          borderRadius: '4px',
        },
      },
    }}
    sx={{
      ml: '4px',
      width: 130,
    }}
    variant="standard"
    {...props}
  >
    {props.children}
  </MuiSelect>
);

export default Select;
