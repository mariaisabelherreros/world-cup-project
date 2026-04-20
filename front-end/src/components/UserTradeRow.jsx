import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const TradeRowCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const UserTradeRow = ({ user }) => {
  return (
    <TradeRowCard variant="outlined">
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          src={user.profilePic}
          alt={user.username}
          sx={{ width: 56, height: 56 }}
        />
        <Link
          component="button"
          variant="h6"
          fontWeight="bold"
          underline="hover"
          onClick={() => {}}
          sx={{ color: "text.primary", textAlign: "left" }}
        >
          {user.username}
        </Link>

        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          onClick={() => {}}
          startIcon={<SwapHorizIcon />}
        >
          TRADE
        </Button>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          mt: 2,
          pb: 2,
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(127, 127, 127, 0.5)",
            borderRadius: "10px",
          },
        }}
      >
        {user.tradeList.map((item) => (
          <Card key={item.id} sx={{ minWidth: 120, maxWidth: 120 }}>
            <CardActionArea onClick={() => {}}>
              <CardMedia
                component="img"
                height="140"
                image={item.card.playerImageURL || "../assets/PlaceholderPlayerImage.png"}
                onError={(e) => { e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png"; }}
                alt={item.card.short_name}
              />
              <Box sx={{ p: 1 }}>
                <Typography variant="caption" display="block" fontWeight="bold">
                  {item.card.short_name}
                </Typography>
                <Typography variant="caption" display="block">
                  {item.card.nationality}
                </Typography>
                <Typography variant="caption" display="block">
                  {item.card.rating}
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </TradeRowCard>
  );
};

export default UserTradeRow;
