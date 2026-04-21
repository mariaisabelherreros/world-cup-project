import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Modal,
  styled,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PeopleIcon from "@mui/icons-material/People";
import StyleIcon from "@mui/icons-material/Style";
import InventoryIcon from "@mui/icons-material/Inventory";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { 
  useNavigate,
  useOutletContext,
 } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  borderRadius: theme.shape.borderRadius,
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "hsla(220, 30%, 5%, 0.15) 0px 10px 20px 0px",
  },
}));
export default function Home() {
  const navigate = useNavigate();
  const { user: contextUser, setUser: setContextUser } = useOutletContext();
  const [user, setUser] = React.useState(null);
  const [inventory, setInventory] = React.useState([]);
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState(null);
  const [openCards, setOpenCards] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const open = Boolean(profileMenuAnchor);
  const [cardMenuAnchor, setCardMenuAnchor] = React.useState(null);
  const [selectedCardMenuItem, setSelectedCardMenuItem] = React.useState(null);
  const [isSellDialogOpen, setIsSellDialogOpen] = React.useState(false);
  const [cardPackMessage, setCardPackMessage] = React.useState("");

  React.useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
    }
  }, [contextUser]);

  const handleOpenCardPack = React.useCallback(async (packSize = 5, packCost = 0) => {
    if (!user || !user.id) {
      console.log("User not available for pack opening");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:4000/api/open-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          packSize: packSize,
          packCost: packCost,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOpenCards(data.cards);
        if (packSize === 10) {
          setCardPackMessage("Welcome Starter Pack!");
        } else if (packCost > 0) {
          setCardPackMessage("5-Card Pack");
        } else {
          setCardPackMessage("Free Daily Pack!");
        }        setIsModalOpen(true);
        
        const invRes = await fetch(`http://localhost:4000/api/inventory/${user.id}`);
        const invData = await invRes.json();
        setInventory(invData);
        
        // Update BOTH local and context user
        const updatedUser = {
          ...user,
          currency: data.newCurrency,
          lastDailyPack: new Date().toISOString(),
        };
        setUser(updatedUser);
        setContextUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        alert(data.error || "Something went wrong opening the pack.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Could not connect to the server.");
    }
  }, [user?.id, setContextUser]);

  React.useEffect(() => {
    const handleOpenPack = (event) => {
      const { packSize, packCost } = event.detail;
      handleOpenCardPack(packSize, packCost);
    };

    window.addEventListener("openPack", handleOpenPack);
    return () => window.removeEventListener("openPack", handleOpenPack);
  }, [handleOpenCardPack]);
  
  // Load inventory and trigger welcome/daily packs
  React.useEffect(() => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    if (user && user.id) {
      fetch(`http://localhost:4000/api/inventory/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setInventory(data);

          // Welcome pack: new user with empty inventory and 0 currency
          if (data.length === 0 && user.currency === 0) {
            console.log("Opening welcome pack for new user");
            setCardPackMessage("Welcome Starter Pack!");
            handleOpenCardPack(10, 0);
          }

          // // Daily pack: user has items and last pack was before today's midnight
          else if (data.length > 0 && user.lastDailyPack) {
            const lastPack = new Date(user.lastDailyPack);
            lastPack.setHours(0, 0, 0, 0);
            
            if (lastPack < midnight) {
              console.log("Opening daily pack - new day");
              setCardPackMessage("Free Daily Pack!");
              handleOpenCardPack(5, 0);
            }
          }
        })
        .catch((err) => console.error("Error loading inventory:", err));
    }
  }, [user?.id, user?.currency, handleOpenCardPack]);


  const handleSellCard = async (item) => {
    // Calculate sell price (Rating squared)
    const sellPrice = Math.pow(item.card.rating, 2);

    try {
      const response = await fetch("http://localhost:4000/api/sell-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          cardId: item.card.id,
          sellPrice: sellPrice,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update BOTH local state and context
        const updatedUser = {
          ...user,
          currency: data.newCurrency,
        };
        setUser(updatedUser);
        setContextUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update Inventory UI
        setInventory((prev) => {
          return prev
            .map((invItem) => {
              if (invItem.id === item.id) {
                return { ...invItem, quantity: invItem.quantity - 1 };
              }
              return invItem;
            })
            .filter((invItem) => invItem.quantity > 0);
        });
      } else {
        alert("Failed to sell card.");
      }
    } catch (error) {
      console.error("Sell error:", error);
    }
  };

  const groupedInventory = inventory.reduce((groups, item) => {
    const nation = item.card?.nationality || "Unknown";
    if (!groups[nation]) {
      groups[nation] = [];
    }
    groups[nation].push(item);
    return groups;
  }, {});

  const nationalities = Object.keys(groupedInventory).sort();

  const handleProfileMenuOpen = (event) =>
    setProfileMenuAnchor(event.currentTarget);
  const handleProfileMenuClose = () => setProfileMenuAnchor(null);
  const handleCardMenuOpen = (event, item) => {
    setCardMenuAnchor(event.currentTarget);
    setSelectedCardMenuItem(item);
  };

  const handleCardMenuClose = () => {
    setCardMenuAnchor(null);
    setSelectedCardMenuItem(null);
  };
  const handleOpenSellDialog = () => {
    setIsSellDialogOpen(true);
    setCardMenuAnchor(null);
  };
  const handleCloseSellDialog = () => {
    setIsSellDialogOpen(false);
    setSelectedCardMenuItem(null);
  };

  const handleToggleTrade = async (item) => {
    const endpoint = item.isForTrade ? "remove" : "add";
    
    try {
      const response = await fetch(`http://localhost:4000/api/trade-list/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, cardId: item.card.id }),
      });
  
      if (response.ok) {
        setInventory((prev) =>
          prev.map((invItem) =>
            invItem.id === item.id ? { ...invItem, isForTrade: !item.isForTrade } : invItem
          )
        );
      }
    } catch (error) {
      console.error("Trade toggle error:", error);
    }
  };

  return (
    <Box
      sx={{ minHeight: "100vh", width: "75%", bgcolor: "background.default" }}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <Box sx={{ p: 4 }}>
          {nationalities.map((nation) => (
            <Box key={nation} sx={{ mb: 6 }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 3,
                  fontWeight: "bold",
                  color: "#1976d2",
                  borderBottom: "2px solid #1976d2",
                  pb: 1,
                }}
              >
                {nation}
              </Typography>
              <Grid container spacing={3}>
                {groupedInventory[nation].map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={item.id}>
                    <Card
                      sx={{
                        width: 200,
                        height: 325,
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <IconButton
                        aria-label="settings"
                        onClick={(e) => handleCardMenuOpen(e, item)}
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          zIndex: 1,
                          color: "#000000",
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.card?.playerImageURL || "../src/assets/PlaceholderPlayerImage.png"}
                        referrerPolicy = "no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png";
                        }}
                        sx={{ objectFit: "cover" }}
                      />
                      <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          noWrap
                          sx={{ fontWeight: "bold" }}
                        >
                          {item.card?.short_name}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          Rating: {item.card?.rating || "N/A"}
                        </Typography>
                        <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid #eee" }}>
                          <Typography
                            variant="body2"
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                          >
                            x{item.quantity}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>

        {/* Pack Opening Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              p: 4,
              borderRadius: 4,
              boxShadow: 24,
              maxWidth: "90vw",
              textAlign: "center",
              outline: "none",
            }}
          >
            <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
              {cardPackMessage}
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              {openCards.map((card, index) => (
                <Grid item key={index}>
                  <Card sx={{ width: 180, height: 300 }}>
                    <Typography variant="h7" display="block" color="primary">
                      {card.nationality}
                    </Typography>
                    <CardMedia
                      component="img"
                      height="160"
                      image={card.playerImageURL || "../src/assets/PlaceholderPlayerImage.png"} /*"https://img.freepik.com/premium-vector/editable-design-icon-football_362714-11701.jpg?semt=ais_rp_progressive&w=740&q=80"*/
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "../src/assets/PlaceholderPlayerImage.png";
                      }}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                        noWrap
                      >
                        {card.short_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rating: {card.rating}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Button
              variant="contained"
              sx={{ mt: 4 }}
              onClick={() => setIsModalOpen(false)}
            >
              Add to Inventory
            </Button>
          </Box>
        </Modal>
      </Box>
      {/* Card Actions Menu */}
      <Menu
        anchorEl={cardMenuAnchor}
        open={Boolean(cardMenuAnchor)}
        onClose={handleCardMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            handleCardMenuClose();
            handleToggleTrade(selectedCardMenuItem);
          }}
        >
          <InventoryIcon sx={{ mr: 1, fontSize: "small" }} />
          {selectedCardMenuItem?.isForTrade ? "Remove from Trade List" : "List for Trade"}
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleOpenSellDialog();
          }}
          sx={{ color: "error.main" }}
        >
          <StyleIcon sx={{ mr: 1, fontSize: "small" }} />
          Sell (
          {selectedCardMenuItem
            ? Math.pow(selectedCardMenuItem.card.rating, 2)
            : 0}
          )
        </MenuItem>
      </Menu>

      {/* Sell Confirmation Dialog */}
      <Dialog open={isSellDialogOpen} onClose={handleCloseSellDialog}>
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          Confirm Sale
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", minWidth: 300 }}>
          <Typography variant="body1">
            Are you sure you want to sell{" "}
            <strong>{selectedCardMenuItem?.card.short_name}</strong>?
          </Typography>

          {/* Show the card details in the popup */}
          <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
            <Typography variant="h6" color="primary">
              +
              {selectedCardMenuItem
                ? Math.pow(selectedCardMenuItem.card.rating, 2)
                : 0}{" "}
              Currency
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button onClick={handleCloseSellDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSellCard(selectedCardMenuItem);
              handleCloseSellDialog();
            }}
            variant="contained"
            color="error"
          >
            Confirm Sell
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
