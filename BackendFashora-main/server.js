// // server.js
// require("dotenv").config();
// const app = require("./index");
// const connectDB = require("./config/db");

// const PORT = process.env.PORT || 5006;

// connectDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`✅ Server started on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Failed to connect to DB:", err.message);
//   });
