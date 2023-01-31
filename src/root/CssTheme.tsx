import {
  ColorSystemOptions,
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { ReactNode } from 'react';

declare module '@mui/material/styles' {
  interface CommonColors {
    grey: string;
    contrastGrey: string;
  }
  interface Palette {
    border?: Palette['primary'];
  }
  interface PaletteOptions {
    border?: PaletteOptions['primary'];
  }
}

const shadow = 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px';
const shadowHov = 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px';

const common: ColorSystemOptions = {
  palette: {
    primary: {
      main: '#1caf7b',
      light: '#3ee0a7',
      dark: '#147b57',
    },
    secondary: {
      main: '#fc4283',
      light: '#fd8eb5',
      dark: '#bd3162',
    },
    success: {
      main: '#6cda71',
    },
    info: {
      main: '#4eb9ff',
    },
    error: {
      main: '#ff6255',
    },
  },
};

const dark: ColorSystemOptions = {
  palette: {
    ...common.palette,
    border: {
      main: '#323637',
    },
    common: {
      black: '#101010',
      white: '#f9f9f9',
      grey: grey['600'],
      contrastGrey: grey['900'],
    },
  },
};

const light: ColorSystemOptions = {
  palette: {
    ...common.palette,
    background: {
      default: '#fefefe',
      paper: '#fdfdfd',
    },
    border: {
      main: '#eff3f4',
    },
    common: {
      black: '#101010',
      white: '#f9f9f9',
      grey: grey['400'],
      contrastGrey: grey['100'],
    },
    text: {
      primary: 'rgba(0, 0, 0, 1)',
      secondary: 'rgba(0, 0, 0, 0.85)',
    },
  },
};

const theme = extendTheme({
  colorSchemes: {
    dark,
    light,
  },
  components: {
    MuiChip: {
      styleOverrides: {
        colorPrimary: ({ theme: { vars } }) => ({
          ':hover': {
            backgroundColor: `rgba(${vars.palette.primary.mainChannel} / 0.80)`,
          },
        }),
        root: ({ theme: { vars } }) => ({
          ':hover': {
            backgroundColor: vars.palette.action.disabled,
          },
        }),
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: ({ theme: { vars } }) => ({
          color: vars.palette.common.grey,
          height: '4px',
          ':hover': {
            color: vars.palette.primary.main,
          },
        }),
        thumb: ({ theme: { vars } }) => ({
          boxShadow: shadow,
          color: vars.palette.common.white,
          ':hover': {
            boxShadow: shadowHov,
            color: vars.palette.common.white,
          },
        }),
        thumbColorPrimary: {
          transition: 'none',
        },
        track: {
          border: 'none',
          transition: 'none',
        },
      },
    },
  },
  typography: {
    fontFamily: 'Arimo, sans-serif',
  },
});

interface CssThemeProps {
  children: ReactNode;
}

const CssTheme = ({ children }: CssThemeProps) => (
  <CssVarsProvider theme={theme}>
    {children}
  </CssVarsProvider>
);

export default CssTheme;
