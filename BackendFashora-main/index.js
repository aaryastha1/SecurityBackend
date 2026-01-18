

require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const app = express();

// ✅ CORS — FIXED
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const userRoutes = require("./routers/userRoutes");
const userProductRoutes = require("./routers/userProductRoutes");
const adminUserRoutes = require("./routers/admin/userRouteAdmin");
const adminCategoryRoutes = require("./routers/admin/CategoryRouteAdmin");
const adminProductRoutes = require("./routers/admin/productRouteAdmin");
const adminRoute = require("./routers/admin/adminRoute");
const favoriteRoutes = require("./routers/FavoriteRoutes");
const orderRoutes = require("./routers/admin/OrderRoute");
const cartRoutes = require("./routers/cartRoutes");
const esewaRoutes = require("./routers/esewaRoutes");

// Rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts, try again after 15 minutes" },
});

app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/user", userProductRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/esewa", esewaRoutes);

connectDB();

app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/category", adminCategoryRoutes);
app.use("/api/admin/product", adminProductRoutes);
app.use("/api/admins", adminRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => res.send("Hello"));

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
