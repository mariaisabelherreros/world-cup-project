import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import UserTradeRow from "../components/UserTradeRow";

const Community = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/community")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error:", err));
  }, []);

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
            <UserTradeRow key={user.id} user={user} />
          ))
        )}
      </Stack>
    </Container>
  );
};

export default Community;
