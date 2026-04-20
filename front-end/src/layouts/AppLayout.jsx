import * as React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PeopleIcon from "@mui/icons-material/People";
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
  const [user, setUser] = React.useState(null);

  const theme = React.useMemo(() => getTheme(mode), [mode]);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));

  const isPageAfterLogin = location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/forgot_password";
  const isHomePage = location.pathname === "/home";

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme-mode", newMode);
      return newMode;
    });
  };

  React.useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    
    if (storedUser && token && isPageAfterLogin) {
      fetchUserData(storedUser.id, token);
    } else {
      setUser(storedUser);
    }
  }, [isPageAfterLogin]);
  
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

  const handleProfileMenuOpen = (event) =>
    setProfileMenuAnchor(event.currentTarget);

  const handleProfileMenuClose = () => setProfileMenuAnchor(null);

  const handleLogout = () => {
    setProfileMenuAnchor(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  }

  const gradient =
    mode === "light"
      ? "radial-gradient(ellipse at 50% 40%, hsl(210,100%,97%), white)"
      : "radial-gradient(ellipse at 50% 40%, hsl(210,60%,15%), hsl(220,30%,5%))";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Stack sx={{ minHeight: "100vh", width: "100%", background: gradient }}>
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

              {isHomePage && (
                <Button
                  color="inherit"
                  startIcon={<LibraryBooksIcon />}
                  sx={{
                    fontSize: isMobile ? "0.75rem" : "1rem",
                    padding: isMobile ? "4px 8px" : "6px 16px",
                  }}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("openPack", {
                        detail: { packSize: 5, packCost: 0 },
                      })
                    );
                  }}
                >
                  {!isMobile && "Open Pack"}
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
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
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

            <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
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
                <MenuItem onClick={handleProfileMenuClose}>
                  Profile Page
                </MenuItem>
                {user?.isAdmin && (
                  <MenuItem onClick={handleAdminClick}>Admin</MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>

            <IconButton onClick={toggleTheme} sx={{ ml: isMobile ? 0 : 2 }}>
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Toolbar>
        )}

        <Box sx={{ flex: 1, width: "100%", display: "flex", justifyContent: "center" }}>
          <Outlet context={{ user, setUser }} />
        </Box>

        <BackToTop />
      </Stack>
    </ThemeProvider>
  );
}