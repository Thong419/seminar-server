import mongoose from "mongoose";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";
import path from "path";
import app from "./app.js";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

// Kết nối MongoDB
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => console.log("✅ DB connection successful!"));

// Đọc các file chứng chỉ
const httpsOptions = {
  key: fs.readFileSync("./secrets/certificate/private.key"),
  cert: fs.readFileSync("./secrets/certificate/certificate.crt"),
  ca: fs.readFileSync("./secrets/ca/ca.crt"),
  requestCert: false,
  rejectUnauthorized: true, // nếu chỉ cần server xác thực, không cần client cert
};

// Tạo server HTTPS
const port = process.env.PORT || 443;
const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`🚀 App running over HTTPS on port ${port}...`);
});

// Bắt lỗi Promise
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import https from "https";
// import fs from "fs";
// import app from "./app.js";

// process.on("uncaughtException", (err) => {
//   console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
//   console.log(err.name, err.message);
//   process.exit(1);
// });

// dotenv.config({ path: "./config.env" });

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );

// mongoose
//   .connect(DB, {
//     // useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useFindAndModify: false,
//   })
//   .then(() => console.log("DB connection successful!"));

// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION! 💥 Shutting down...");
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// process.on("SIGTERM", () => {
//   console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
//   server.close(() => {
//     console.log("💥 Process terminated!");
//   });
// });
