import * as React from "react";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { getTheme } from "../theme/theme";

export default function AppLayout() {
  const [mode, setMode] = React.useState("light");

  const theme = React.useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const gradient =
    mode === "light"
      ? "radial-gradient(ellipse at 50% 40%, hsl(210,100%,97%), white)"
      : "radial-gradient(ellipse at 50% 40%, hsl(210,60%,15%), hsl(220,30%,5%))";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <IconButton
        onClick={toggleTheme}
        sx={{ position: "fixed", top: 16, right: 16, zIndex: 1300 }}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>

      <Stack
        sx={{
          minHeight: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: gradient,
          p: 2,
        }}
      >
        <Outlet />
      </Stack>
    </ThemeProvider>
  );
}