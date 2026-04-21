import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import UserTradeRow from "../components/UserTradeRow";

const Community = () => {
  const [users, setUsers] = useState([]);
  const [userInventory, setUserInventory] = useState([]);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [selectedTradeCard, setSelectedTradeCard] = useState(null);
  const [selectedMyCard, setSelectedMyCard] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchCommunityData = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/community");
      const data = await response.json();
      setUsers(data);
      console.log("Fetched community data:", data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchCommunityData();
    
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
    
    if (user?.id) {
      fetch(`http://localhost:4000/api/inventory/${user.id}`)
        .then(res => res.json())
        .then(data => setUserInventory(data))
        .catch(err => console.error("Error loading inventory:", err));
    }

    const handleTradeUpdate = () => {
      fetchCommunityData();
    };
    
    window.addEventListener('tradeListUpdated', handleTradeUpdate);
    return () => window.removeEventListener('tradeListUpdated', handleTradeUpdate);
  }, []);

  const handleTradeClick = (card) => {
    setSelectedTradeCard(card);
    setTradeDialogOpen(true);
  };

  const handleConfirmTrade = async () => {
    if (!selectedMyCard) {
      setSnackbar({ open: true, message: "Please select a card to offer", severity: "warning" });
      return;
    }
  
    try {
      const response = await fetch("http://localhost:4000/api/trade-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: currentUser.id,
          receiverId: selectedTradeCard.userId,
          requestedCardId: selectedTradeCard.card.id,
          offeredCardId: selectedMyCard.card.id
        })
      });

      if (response.ok) {
        setSnackbar({ open: true, message: "Trade request sent!", severity: "success" });
        setTradeDialogOpen(false);
        setSelectedTradeCard(null);
        setSelectedMyCard(null);
      } else {
        const errorData = await response.json();
        setSnackbar({ open: true, message: errorData.error || "Failed to send trade request", severity: "error" });
      }
    } catch (error) {
      console.error("Trade error:", error);
      setSnackbar({ open: true, message: "Error sending trade request", severity: "error" });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Community Page
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Available Trades:
      </Typography>

      <Stack spacing={4} sx={{ mt: 4 }}>
        {users.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
            No users currently have cards listed for trade.
          </Typography>
        ) : (
          users.map((user) => (
            <UserTradeRow 
              key={user.id} 
              user={user}
              onTradeClick={handleTradeClick}
              currentUserId={currentUser?.id}
            />
          ))
        )}
      </Stack>

      <Dialog open={tradeDialogOpen} onClose={() => setTradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Select a card to offer for {selectedTradeCard?.card?.short_name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 2 }}>
            Your inventory:
          </Typography>
          <Grid container spacing={2}>
            {userInventory.map((item) => (
              <Grid item xs={6} key={item.id}>
                <Card
                  onClick={() => setSelectedMyCard(item)}
                  sx={{
                    cursor: "pointer",
                    border: selectedMyCard?.id === item.id ? "3px solid blue" : "none",
                    opacity: selectedMyCard?.id === item.id ? 1 : 0.7
                  }}
                >
                  <CardMedia
                    component="img"
                    height="120"
                    image={item.card?.playerImageURL || "../src/assets/PlaceholderPlayerImage.png"}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png";
                    }}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="caption" noWrap>
                      {item.card?.short_name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTradeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmTrade}
            variant="contained"
            disabled={!selectedMyCard}
          >
            Send Trade Request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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
    </Container>
  );
};

export default Community;