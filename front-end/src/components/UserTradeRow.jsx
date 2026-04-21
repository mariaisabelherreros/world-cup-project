import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

export default function UserTradeRow({ user, onTradeClick, currentUserId }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          bgcolor: "#000000",
          borderRadius: 2,
          p: 2,
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "#1a1a1a",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#555",
            borderRadius: "4px",
            "&:hover": {
              bgcolor: "#777",
            },
          },
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            fontWeight: "bold",
            color: "#ffffff"
          }}
        >
          {user.username}'s Trade List
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            minWidth: "min-content",
          }}
        >
          {user.tradeList.map((item) => (
            <Box
              key={item.id}
              sx={{
                flex: "0 0 auto",
                width: 200,
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={item.card?.playerImageURL || "../src/assets/PlaceholderPlayerImage.png"}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png";
                  }}
                />
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} noWrap>
                    {item.card?.short_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating: {item.card?.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.card?.nationality}
                  </Typography>
                  {currentUserId !== user.id && (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: "auto", width: "100%" }}
                      onClick={() => onTradeClick({ ...item, userId: user.id })}
                    >
                      Trade
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}