import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Card,
  CardContent,
  Alert,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate, useOutletContext } from "react-router-dom";

const ProfileCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 720,
  margin: "32px auto",
  borderRadius: theme.shape.borderRadius,
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

export default function User() {
  const navigate = useNavigate();
  const { user, setUser } = useOutletContext();

  // null = untouched (falls back to current user value)
  const [bio, setBio] = React.useState(null);
  const [profilePic, setProfilePic] = React.useState(null);
  const [profileMessage, setProfileMessage] = React.useState("");
  const [profileError, setProfileError] = React.useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordMessage, setPasswordMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser && !user) {
      setUser(storedUser);
    }
  }, [navigate, setUser, user]);

  const effectiveBio = bio ?? user?.bio ?? "";
  const effectiveProfilePic = profilePic ?? user?.profilePic ?? "";

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/users/me/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: effectiveBio,
          profilePic: effectiveProfilePic,
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setProfileMessage(result.message || "Profile updated successfully.");
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        setProfileError(result.message || "Unable to update profile.");
      }
    } catch {
      setProfileError("Could not reach server.");
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/users/me/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setPasswordMessage(result.message || "Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(result.message || "Unable to change password.");
      }
    } catch {
      setPasswordError("Could not reach server.");
    }
  };

  const avatarSrc = !avatarLoadFailed && effectiveProfilePic ? effectiveProfilePic : undefined;

  return (
    <ProfileCard>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          User Profile
        </Typography>

        <Box
          component="form"
          onSubmit={handleSaveProfile}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography variant="h6">Profile Picture</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={avatarSrc}
              alt={user?.username || "User"}
              sx={{ width: 96, height: 96 }}
              slotProps={{
                img: {
                  referrerPolicy: "no-referrer",
                  onError: () => setAvatarLoadFailed(true),
                },
              }}
            >
              <AccountCircle />
            </Avatar>
            <TextField
              fullWidth
              label="Profile image URL"
              value={effectiveProfilePic}
              onChange={(e) => {
                setAvatarLoadFailed(false);
                setProfilePic(e.target.value);
              }}
              placeholder="https://example.com/profile.jpg"
            />
          </Box>

          <FormControl>
            <FormLabel htmlFor="bio">Bio</FormLabel>
            <TextField
              id="bio"
              multiline
              minRows={4}
              value={effectiveBio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself"
            />
          </FormControl>

          {profileMessage && <Alert severity="success">{profileMessage}</Alert>}
          {profileError && <Alert severity="error">{profileError}</Alert>}

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained">
              Save Profile
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box
          component="form"
          onSubmit={handleChangePassword}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography variant="h6">Change Password</Typography>

          <TextField
            type="password"
            label="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <TextField
            type="password"
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <TextField
            type="password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {passwordMessage && <Alert severity="success">{passwordMessage}</Alert>}
          {passwordError && <Alert severity="error">{passwordError}</Alert>}

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" color="secondary">
              Change Password
            </Button>
          </Box>
        </Box>
      </CardContent>
    </ProfileCard>
  );
}