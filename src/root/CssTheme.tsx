import {
  ColorSystemOptions,
  Experimental_CssVarsProvider as CssVarsProvider,
  CssVarsTheme,
  Theme,
  experimental_extendTheme as extendTheme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import chroma from 'chroma-js';
import { ReactNode, useMemo } from 'react';

declare module '@mui/material/styles' {
  interface CommonColors {
    grey: string;
    contrastGrey: string;
    overlay: string;
  }
  interface Palette {
    border?: Palette['primary'];
  }
  interface PaletteOptions {
    border?: PaletteOptions['primary'];
  }
  interface TypeAction {
    hoverSelected: string;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    banner: true;
    header: true;
    home: true;
    title: true;
  }
}

const shadow = 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px';
const shadowHov = 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px';

const dark = (primaryColor: string): ColorSystemOptions => ({
  palette: {
    action: {
      hoverSelected: ` 
          rgba(var(--mui-palette-action-selectedChannel) 
          / calc(var(--mui-palette-action-selectedOpacity) 
          + var(--mui-palette-action-hoverOpacity)))
      `,
    },
    primary: {
      dark: chroma(primaryColor).darken().hex(),
      main: primaryColor,
      light: chroma(primaryColor).brighten().hex(),
      contrastText: 'rgba(0, 0, 0, 1)',
    },
    success: {
      main: '#6cda71',
      contrastText: 'rgba(0, 0, 0, 1)',
    },
    info: {
      main: '#4eb9ff',
      contrastText: 'rgba(0, 0, 0, 1)',
    },
    error: {
      main: '#ff6347',
      contrastText: 'rgba(0, 0, 0, 1)',
    },
    border: {
      main: '#323637',
    },
    common: {
      black: '#101010',
      white: '#f9f9f9',
      grey: grey['600'],
      contrastGrey: grey['900'],
      overlay: 'linear-gradient(rgba(255,255,255,0.04),rgba(255,255,255,0.04))',
    },
  },
});

const light = (primaryColor: string): ColorSystemOptions => ({
  palette: {
    action: {
      hoverSelected: ` 
          rgba(var(--mui-palette-action-selectedChannel) 
          / calc(var(--mui-palette-action-selectedOpacity) 
          + var(--mui-palette-action-hoverOpacity)))
      `,
    },
    primary: {
      dark: chroma(primaryColor).darken().hex(),
      main: primaryColor,
      light: chroma(primaryColor).brighten().hex(),
      contrastText: 'rgba(255, 255, 255, 1)',
    },
    success: {
      main: '#6cda71',
      contrastText: 'rgba(255, 255, 255, 1)',
    },
    info: {
      main: '#4eb9ff',
      contrastText: 'rgba(255, 255, 255, 1)',
    },
    error: {
      main: '#ff6347',
      contrastText: 'rgba(255, 255, 255, 1)',
    },
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
      overlay: 'linear-gradient(rgba(0,0,0,0.02),rgba(0,0,0,0.02))',
    },
    text: {
      primary: 'rgba(0, 0, 0, 1)',
      secondary: 'rgba(0, 0, 0, 0.85)',
    },
  },
});

const createTheme = (primaryColor: string): Omit<Theme, 'palette'> & CssVarsTheme => extendTheme({
  colorSchemes: {
    dark: dark(primaryColor),
    light: light(primaryColor),
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: 'var(--mui-palette-common-overlay)',
          boxShadow: 'none',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        option: ({ theme: { vars } }) => ({
          color: vars.palette.text.secondary,
          ':hover': {
            color: vars.palette.text.primary,
          },
        }),
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: ({ theme: { vars } }) => ({
          '& .MuiChip-label': {
            fontWeight: 700,
          },
          ':hover': {
            backgroundColor: vars.palette.primary.light,
          },
        }),
        root: ({ theme: { vars } }) => ({
          ':hover': {
            backgroundColor: vars.palette.action.hoverSelected,
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme: { vars } }) => ({
          backgroundImage: vars.palette.common.overlay,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme: { vars } }) => ({
          backgroundColor: vars.palette.background.paper,
          border: '1px solid',
          borderColor: vars.palette.border!.main,
          height: 'calc(100vh - 154px)',
          marginRight: '8px',
          marginTop: '54px',
          paddingLeft: '4px',
          width: 294,
          '&::-webkit-scrollbar': {
            display: 'none',
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
    MuiSwitch: {
      styleOverrides: {
        root: ({ theme: muiTheme }) => ({
          height: 38,
          width: 58,
          padding: '8px',
          transform: 'translate(8px, 0px)',
          '& .Mui-disabled': {
            '& .MuiSwitch-thumb': {
              color: muiTheme.palette.action.selected,
            },
          },
        }),
        switchBase: {
          padding: '10px',
          ':hover': {
            backgroundColor: 'transparent',
          },
          '&.Mui-checked': {
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '& + .MuiSwitch-track': {
              opacity: 1,
            },
          },
        },
        thumb: ({ theme: muiTheme }) => ({
          boxShadow: 'none',
          width: '18px',
          height: '18px',
          color: muiTheme.palette.common.white,
        }),
        track: {
          backgroundColor: grey[500],
          borderRadius: '10px',
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        grouped: ({ theme: muiTheme }) => ({
          height: '32px',
          margin: muiTheme.spacing(0.5),
          border: 0,
          '&:not(:first-of-type)': {
            borderRadius: muiTheme.shape.borderRadius,
          },
          '&:first-of-type': {
            borderRadius: muiTheme.shape.borderRadius,
          },
        }),
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: 'banner' },
          style: {
            color: 'var(--mui-palette-common-white)',
            fontFamily: 'TT Commons, sans-serif',
            fontSize: 'inherit',
            fontWeight: 700,
            textShadow: '2px 4px 8px rgb(40 40 48 / 60%)',
          },
        },
        {
          props: { variant: 'h1' },
          style: {
            fontFamily: 'TT Commons, sans-serif',
            fontSize: '2.75rem',
            fontWeight: '700',
          },
        },
        {
          props: { variant: 'header' },
          style: {
            display: '-webkit-box',
            fontFamily: 'TT Commons, sans-serif',
            fontSize: '1.75rem',
            fontWeight: 600,
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1,
            wordBreak: 'break-all',
          },
        },
        {
          props: { variant: 'home' },
          style: {
            display: '-webkit-box',
            fontFamily: 'TT Commons, sans-serif',
            fontSize: 'var(--home-banner-font-size)',
            lineHeight: 1.1,
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
          },
        },
        {
          props: { variant: 'title' },
          style: {
            display: '-webkit-box',
            fontFamily: 'TT Commons, sans-serif',
            fontSize: '2.125rem',
            fontWeight: 600,
            lineHeight: 1.235,
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
          },
        },
      ],
    },
  },
  typography: {
    fontFamily: 'Arimo, sans-serif',
  },
});

interface CssThemeProps {
  primaryColor: string;
  children: ReactNode;
}

const CssTheme = ({ children, primaryColor }: CssThemeProps) => {
  const theme = useMemo(() => createTheme(primaryColor), [primaryColor]);
  return (
    <CssVarsProvider theme={theme}>
      {children}
    </CssVarsProvider>
  );
};

export default CssTheme;
