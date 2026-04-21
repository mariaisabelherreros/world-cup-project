import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";

const TradeRequests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);

    if (user?.id) {
      fetchTradeRequests(user.id);
    }
  }, []);

  const fetchTradeRequests = async (userId) => {
    try {
      const [incomingRes, sentRes] = await Promise.all([
        fetch(`http://localhost:4000/api/trade-requests/${userId}`),
        fetch(`http://localhost:4000/api/trade-requests/sent/${userId}`)
      ]);
      
      const incomingData = await incomingRes.json();
      const sentData = await sentRes.json();
      
      setIncomingRequests(incomingData);
      setSentRequests(sentData);
    } catch (err) {
      console.error("Error fetching trade requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTrade = async (tradeRequestId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/trade-requests/${tradeRequestId}/accept`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (response.ok) {
        setMessage("Trade accepted successfully!");
        setIncomingRequests(incomingRequests.filter(tr => tr.id !== tradeRequestId));
        // Refresh Home inventory
        window.dispatchEvent(new Event('tradeListUpdated'));
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to accept trade");
      }
    } catch (error) {
      console.error("Error accepting trade:", error);
      setMessage("Error accepting trade");
    }
  };

  const handleRejectTrade = async (tradeRequestId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/trade-requests/${tradeRequestId}/reject`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (response.ok) {
        setMessage("Trade rejected");
        setIncomingRequests(incomingRequests.filter(tr => tr.id !== tradeRequestId));
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to reject trade");
      }
    } catch (error) {
      console.error("Error rejecting trade:", error);
      setMessage("Error rejecting trade");
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Trade Requests
      </Typography>

      {message && (
        <Alert severity={message.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {/* Incoming Requests */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: "bold" }}>
        Incoming Offers
      </Typography>
      <Stack spacing={3} sx={{ mb: 6 }}>
        {incomingRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No incoming trade requests
          </Typography>
        ) : (
          incomingRequests.map((request) => (
            <Card key={request.id} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                <Chip label="INCOMING" size="small" color="primary" sx={{ mr: 1 }} />
                Offer from <strong>{request.requester.username}</strong>
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                    They're offering:
                  </Typography>
                  <Card sx={{ maxWidth: 250 }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={request.offeredCard?.playerImageURL || "../src/assets/PlaceholderPlayerImage.png"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png";
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} noWrap>
                        {request.offeredCard?.short_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rating: {request.offeredCard?.rating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.offeredCard?.nationality}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                    You're offering:
                  </Typography>
                  <Card sx={{ maxWidth: 250 }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={request.requestedCard?.playerImageURL || "../src/assets/PlaceholderPlayerImage.png"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png";
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} noWrap>
                        {request.requestedCard?.short_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rating: {request.requestedCard?.rating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.requestedCard?.nationality}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRejectTrade(request.id)}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAcceptTrade(request.id)}
                >
                  Accept
                </Button>
              </Box>
            </Card>
          ))
        )}
      </Stack>

      {/* Sent Requests */}
      <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: "bold" }}>
        Sent Offers
      </Typography>
      <Stack spacing={3}>
        {sentRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No sent trade requests
          </Typography>
        ) : (
          sentRequests.map((request) => (
            <Card key={request.id} sx={{ p: 3, opacity: 0.8 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                <Chip label="PENDING" size="small" color="warning" sx={{ mr: 1 }} />
                Offer to <strong>{request.receiver.username}</strong>
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                    You're offering:
                  </Typography>
                  <Card sx={{ maxWidth: 250 }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={request.offeredCard?.playerImageURL || "../src/assets/PlaceholderPlayerImage.png"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png";
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} noWrap>
                        {request.offeredCard?.short_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rating: {request.offeredCard?.rating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.offeredCard?.nationality}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
                    They're offering:
                  </Typography>
                  <Card sx={{ maxWidth: 250 }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={request.requestedCard?.playerImageURL || "../src/assets/PlaceholderPlayerImage.png"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png";
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} noWrap>
                        {request.requestedCard?.short_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rating: {request.requestedCard?.rating}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.requestedCard?.nationality}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
                <Typography variant="body2" color="text.secondary">
                  Awaiting response...
                </Typography>
              </Box>
            </Card>
          ))
        )}
      </Stack>
    </Container>
  );
};

export default TradeRequests;