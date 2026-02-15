import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#e0e0e0",
      light: "#ffffff",
      dark: "#b0b0b0",
      contrastText: "#0a0a0f",
    },
    secondary: {
      main: "#00e5ff",
      light: "#6effff",
      dark: "#00b2cc",
      contrastText: "#0a0a0f",
    },
    background: {
      default: "#0a0a0f",
      paper: "#12121a",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "#a0a0a8",
      disabled: "#606068",
    },
    error: {
      main: "#ff5252",
    },
    success: {
      main: "#00e676",
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 0 20px rgba(0, 229, 255, 0.15)",
          },
        },
        containedPrimary: {
          backgroundColor: "#e0e0e0",
          color: "#0a0a0f",
          "&:hover": {
            backgroundColor: "#ffffff",
          },
        },
        outlinedPrimary: {
          borderColor: "rgba(255, 255, 255, 0.3)",
          color: "#e0e0e0",
          "&:hover": {
            borderColor: "rgba(255, 255, 255, 0.5)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.12)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.25)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#00e5ff",
              borderWidth: 1,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          background: "rgba(10, 10, 15, 0.85)",
          backdropFilter: "blur(12px)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255, 255, 255, 0.06)",
        },
      },
    },
  },
});

export function AppTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default theme;
