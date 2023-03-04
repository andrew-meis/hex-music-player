import { Select as MuiSelect, SelectProps } from '@mui/material';

const Select = ({
  ...props
}: SelectProps) => (
  <MuiSelect
    disableUnderline
    MenuProps={{
      sx: {
        marginTop: '4px',
      },
    }}
    SelectDisplayProps={{
      style: {
        paddingLeft: '4px',
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
