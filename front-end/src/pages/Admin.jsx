import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [users, setUsers] = React.useState([]);
  const [bannedEmails, setBannedEmails] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState(null);
  const [selectedBannedEmailId, setSelectedBannedEmailId] = React.useState(null);

  React.useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.isAdmin) {
      navigate("/home");
    } else {
      setUser(storedUser);
      fetchUsers();
      fetchBannedEmails();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching from: http://localhost:4000/admin/users");
      const response = await fetch('http://localhost:4000/admin/users');
      console.log("Response status:", response.status);
      
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBannedEmails = async () => {
    try {
      const response = await fetch('http://localhost:4000/admin/banned-emails');
      if (!response.ok) throw new Error('Failed to fetch banned emails');
      const data = await response.json();
      setBannedEmails(data || []);
    } catch (err) {
      setBannedEmails([]);
    }
  };

  const handleConfirmDelete = async () => {
    setOpenDialog(false);
    
    try {
      const response = await fetch(`http://localhost:4000/admin/users/${selectedUserId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      setUsers(users.filter(user => user.id !== selectedUserId));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await fetchBannedEmails();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
    } finally {
      setSelectedUserId(null);
    }
  };

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setOpenDialog(true);
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setSelectedUserId(null);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ maxWidth: 752, margin: '0 auto', p: 2 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Admin Page: User Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h6" sx={{ mb: 2 }}>Active Users</Typography>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
        <List>
          {users.map((user) => (
            <ListItem
              key={user.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteClick(user.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar 
                  src={user.profilePic || undefined} 
                  alt={user.username}
                  sx={{ bgcolor: '#1976d2' }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.username}
                secondary={user.email}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2 }}>Banned Users</Typography>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List>
          {bannedEmails.length > 0 ? (
            bannedEmails.map((bannedEmail) => (
              <ListItem
                key={bannedEmail.id}
              >
                <ListItemText
                  primary={bannedEmail.email}
                  secondary="Banned"
                  secondaryTypographyProps={{ sx: { color: 'error.main' } }}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No banned users" />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Ban User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to ban this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Ban
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}