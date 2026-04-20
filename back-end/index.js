const { PrismaClient } = require('@prisma/client')
const { withAccelerate } = require('@prisma/extension-accelerate');
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { openCardPack } = require("./src/openCardPack.ts");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = Number(process.env.PORT || 4000);

const prisma = new PrismaClient().$extends(withAccelerate())

const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const PORT = 4000;

const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const logSentMail = (info, to, subject) => {
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log("[MAIL] Forgot-password email sent");
  console.log("  to:", to);
  console.log("  subject:", subject);
  console.log("  messageId:", info.messageId);
  if (previewUrl) {
    console.log("  preview:", previewUrl);
  } else {
    console.log("  response:", info.response || "(no SMTP response)");
  }
};

const allowedOrigins = new Set([
  FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const bannedEmail = await prisma.bannedEmail.findFirst({
      where: { email: email },
    });

    if (bannedEmail) {
      return res.status(400).json("This email has been banned from the platform.");
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json("Username or Email already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...safeUser } = user;

    res.status(201).json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json("An error occurred during registration.");
  }
});

app.get("/api/community", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isPublic: true,
        tradeList: {
          some: {
            status: "AVAILABLE",
          },
        },
      },
      select: {
        id: true,
        username: true,
        profilePic: true,
        tradeList: {
          where: {
            status: "AVAILABLE",
          },
          include: {
            card: true,
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json("An error occurred while fetching community data.");
  }
});

app.post("/login", async (req, res) => {
  const {username, password} = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {username: username},
          {email: username}
        ]
      }
    });

    if (!existingUser) {
      return res.status(400).json({ok: false, message: "Invalid credentials!"});
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      return res.status(400).json({ok: false, message: "Invalid credentials!"});
    }

    const {password: _, ...safeUser} = existingUser;

    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ok: true, user: safeUser, token});

  } catch (error) {
    console.error(error);
    res.status(500).json({ok: false, message: "An error occurred during login."})
  }
  });

    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) return res.status(401).json({ok: false, message: "No token provided"});

      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ok: false, message: "Invalid token"});
        req.user = user;
        next();
      });
    };

    app.get("/users/:id", authenticateToken, async (req, res) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(req.params.id) },
        });
        if (!user) return res.status(404).json({ok: false, message: "User not found"});
        res.json(user);
      } catch (error) {
        res.status(500).json({ok: false, message: "Failed to fetch user"});
      }
    });

app.post("/forgot-password", async (req, res) => {
  const emailInput = (req.body.email || "").trim().toLowerCase();
  const usernameInput = (req.body.username || "").trim();

  // Exactly one identifier must be provided.
  if ((!emailInput && !usernameInput) || (emailInput && usernameInput)) {
    return res.status(400).json({
      ok: false,
      message: "Provide either email or username.",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: emailInput
          ? { email: emailInput }
          : { username: usernameInput },
    });

    // Always return generic success to prevent account enumeration.
    if (!user) {
      return res.json({
        ok: true,
        message: "If an account exists, a reset email has been sent.",
      });
    }

    // Create one-time token (store with expiry in DB).
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

    await prisma.token.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiredAt: expiresAt,
      },
    });

    const resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(
        resetToken
    )}`;

    const subject = "Reset your password";
    const text = `Use this link to reset your password: ${resetLink}\nThis link expires in 30 minutes.`;
    const html = `<p>Click to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 30 minutes.</p>`;

    const mailInfo = await mailer.sendMail({
      from: process.env.MAIL_FROM || "no-reply@worldcup.local",
      to: user.email,
      subject,
      text,
      html,
    });
    logSentMail(mailInfo, user.email, subject);

    return res.json({
      ok: true,
      message: "If an account exists, a reset email has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      ok: false,
      message: "Unable to process request right now.",
    });
  }
});


app.get("/api/inventory/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

    try {
      const inventory = await prisma.inventory.findMany({
        where: {
          userId: userId,
        },
        include: {
          card: true,
        },
      });

      res.json(inventory);
    } catch (error) {
      console.error("Prisma Error:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/open-pack", async (req, res) => {
    try {
      const { userId, packSize, packCost } = req.body;

      // Validate input
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      console.log(`User ${userId} is attempting to open a pack...`);

      // Call the TypeScript function
      const result = await openCardPack(userId, packSize || 5, packCost || 0);

      // Return the new cards to the frontend
      res.json(result);
    } catch (error) {
      console.error("Pack Opening Error:", error.message);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/sell-card", async (req, res) => {
    const { userId, cardId, sellPrice } = req.body;

    try {
      const result = await prisma.$transaction(async (tx) => {
        //Update user's currency
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { currency: { increment: sellPrice } },
        });
        //Find inventory record
        const inventoryItem = await tx.inventory.findFirst({
          where: { userId: userId, cardId: cardId },
        });

        if (!inventoryItem) {
          throw new Error("Card not found in inventory");
        }
        if (inventoryItem.quantity > 1) {
          await tx.inventory.update({
            where: { id: inventoryItem.id },
            data: { quantity: { decrement: 1 } },
          });
        } else {
          await tx.inventory.delete({
            where: { id: inventoryItem.id },
          });
        }
        return updatedUser;
      });
      res.status(200).json({
        message: "Card sold successfully",
        newCurrency: result.currency,
      });
    } catch (error) {
      console.error("Sell error:", error);
      res.status(500).json({ error: "Failed to process sale" });
    }
  });
app.get("/admin/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isAdmin: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        profilePic: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json("An error occurred while fetching users.");
  }
});

app.get("/admin/banned-emails", async (req, res) => {
  try {
    const bannedEmails = await prisma.bannedEmail.findMany({
      select: {
        id: true,
        email: true,
      },
    });
    res.status(200).json(bannedEmails || []);
  } catch (error) {
    res.status(500).json("An error occurred while fetching banned emails.");
  }
});

app.delete("/admin/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await prisma.bannedEmail.create({
      data: {
        email: user.email,
      },
    });

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "User banned successfully." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while banning the user." });
  }
});

app.post("/reset-password", async (req, res) => {
  const tokenInput = String(req.body.token || "").trim();
  const newPassword = String(req.body.newPassword || "");

  if (!tokenInput) {
    return res.status(400).json({ ok: false, message: "Reset token is required." });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      ok: false,
      message: "Password must be at least 8 characters.",
    });
  }

  try {
    const now = new Date();
    const tokenRecord = await prisma.token.findFirst({
      where: {
        token: tokenInput,
        OR: [{ expiredAt: null }, { expiredAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!tokenRecord) {
      return res.status(400).json({
        ok: false,
        message: "Invalid or expired reset token.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { password: hashedPassword },
      });

      // Invalidate all reset tokens for this user after successful password update.
      await tx.token.deleteMany({
        where: { userId: tokenRecord.userId },
      });
    });

    return res.json({
      ok: true,
      message: "Password successfully reset, click here to return to login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      ok: false,
      message: "Unable to reset password right now.",
    });
  }
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
