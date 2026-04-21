import * as React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PeopleIcon from "@mui/icons-material/People";
import MailIcon from "@mui/icons-material/Mail";
import SportsSoccer from "@mui/icons-material/SportsSoccer";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AccountCircle from "@mui/icons-material/AccountCircle";

import { getTheme } from "../theme/theme";
import { useMediaQuery, useTheme as useMuiTheme } from "@mui/material";

import BackToTop from "../components/BackToTop";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = React.useState(() => {
    const savedMode = localStorage.getItem("theme-mode");
    return savedMode || "light";
  });

  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState(null);
  const [user, setUser] = React.useState(() => {
    return JSON.parse(localStorage.getItem("user") || "null");
  });
  const [snackbar, setSnackbar] = React.useState({ open: false, message: "", severity: "error" });

  const theme = React.useMemo(() => getTheme(mode), [mode]);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const publicAuthPages = new Set([
    "/login",
    "/register",
    "/forgot_password",
    "/reset_password",
  ]);
  const isPageAfterLogin = !publicAuthPages.has(location.pathname);
  const isHomePage = location.pathname === "/home";

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme-mode", newMode);
      return newMode;
    });
  };

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:4000/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  React.useEffect(() => {
    if (!isPageAfterLogin) return;

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUserData(storedUser.id, token);
    }
  }, [isPageAfterLogin]);

  const handleProfileMenuOpen = (event) =>
    setProfileMenuAnchor(event.currentTarget);

  const handleProfileMenuClose = () => setProfileMenuAnchor(null);

  const handleProfilePageClick = () => {
    setProfileMenuAnchor(null);
    navigate("/user");
  };

  const handleLogout = () => {
    setProfileMenuAnchor(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  }

  const handleBuyPackClick = () => {
    if (!user) {
      setSnackbar({ open: true, message: "User data not loaded", severity: "error" });
      return;
    }

    if (user.currency < 10000) {
      setSnackbar({
        open: true,
        message: `Insufficient funds! You need 10,000 currency but only have ${user.currency}.`,
        severity: "error"
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent("openPack", {
        detail: { packSize: 5, packCost: 10000 },
      })
    );
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const gradient =
    mode === "light"
      ? "radial-gradient(ellipse at 50% 40%, hsl(210,100%,97%), white)"
      : "radial-gradient(ellipse at 50% 40%, hsl(210,60%,15%), hsl(220,30%,5%))";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Stack sx={{ minHeight: "100vh", width: "100%", background: gradient }}>
        {/* Logo Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 1 : 2,
            width: "100%",
            py: isMobile ? 2 : 4,
            px: isMobile ? 2 : 0,
            bgcolor: mode === "light" ? "#ffffff" : "#1a1a1a",
            borderBottom: mode === "light" ? "1px solid #e0e0e0" : "1px solid #333333",
            boxShadow: mode === "light"
              ? "0 2px 8px rgba(0, 0, 0, 0.1)"
              : "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Box
            component="img"
            sx={{ height: isMobile ? 40 : 60, width: "auto" }}
            alt="Icon Left"
            src="../src/assets/SoccerBall.png"
          />
          <Typography
            variant={isMobile ? "h5" : "h3"}
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              cursor: "pointer",
            }}
          >
            Pocket Players
          </Typography>

          <Box
            component="img"
            sx={{ height: isMobile ? 40 : 60, width: "auto" }}
            alt="Icon Right"
            src="../src/assets/SoccerBall.png"
          />
        </Box>

        {isPageAfterLogin && (
          <Toolbar
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 2 : 0,
              px: isMobile ? 2 : 1,
              py: isMobile ? 2 : 1,
              alignItems: "center",
              bgcolor: mode === "light" ? "#f5f5f5" : "#0d0d0d",
              borderBottom: mode === "light" ? "1px solid #e0e0e0" : "1px solid #333333",
              boxShadow: mode === "light"
                ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                : "0 2px 4px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flex: 1,
                gap: isMobile ? 0.5 : 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                sx={{
                  mr: isMobile ? 0 : 2,
                  fontSize: isMobile ? "0.75rem" : "1rem",
                  padding: isMobile ? "4px 8px" : "6px 16px",
                }}
                color="inherit"
                startIcon={<SportsSoccer />}
                onClick={() => navigate("/home")}
              >
                {!isMobile && "Home"}
              </Button>
              <Button
                sx={{
                  mr: isMobile ? 0 : 2,
                  fontSize: isMobile ? "0.75rem" : "1rem",
                  padding: isMobile ? "4px 8px" : "6px 16px",
                }}
                color="inherit"
                startIcon={<PeopleIcon />}
                onClick={() => navigate("/community")}
              >
                {!isMobile && "Community"}
              </Button>
              <Button
                sx={{
                  mr: isMobile ? 0 : 2,
                  fontSize: isMobile ? "0.75rem" : "1rem",
                  padding: isMobile ? "4px 8px" : "6px 16px",
                }}
                color="inherit"
                startIcon={<MailIcon />}
                onClick={() => navigate("/trade-requests")}
              >
                {!isMobile && "Trade Requests"}
              </Button>

              {isHomePage && (
                <Button
                  color="inherit"
                  startIcon={<LibraryBooksIcon />}
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "1rem",
                    padding: isMobile ? "4px 8px" : "6px 16px",
                  }}
                  onClick={handleBuyPackClick}
                >
                  {!isMobile && "Buy Pack"}
                </Button>
              )}
            </Box>

            {!isMobile && (
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  px: 2,
                  whiteSpace: "nowrap",
                  mr: 3,
                }}
              >
                Total Funds
                <br />
                {user ? user.currency : 0}
              </Typography>
            )}

            {isMobile && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Funds: {user ? user.currency : 0}
              </Typography>
            )}

            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "center" : "flex-end",
                flex: isMobile ? "unset" : 1,
                width: isMobile ? "100%" : "auto",
              }}
            >
              <Button
                color="inherit"
                onClick={handleProfileMenuOpen}
                startIcon={<AccountCircle />}
                sx={{
                  fontSize: isMobile ? "0.75rem" : "1rem",
                  padding: isMobile ? "4px 8px" : "6px 16px",
                }}
              >
                {!isMobile && (user ? user.username : "Loading...")}
              </Button>
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                slotProps={{
                  paper: {
                    sx: { zIndex: 1301 }
                  }
                }}
              >
                <MenuItem onClick={handleProfilePageClick}>
                  Profile Page
                </MenuItem>
                {user?.isAdmin && (
                  <MenuItem onClick={handleAdminClick}>Admin</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>

              <IconButton onClick={toggleTheme} sx={{ ml: isMobile ? 0 : 2 }}>
                {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Box>
          </Toolbar>
        )}

        <Box sx={{ flex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
          <Outlet context={{ user, setUser }} />
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <BackToTop />
      </Stack>
    </ThemeProvider>
  );
}