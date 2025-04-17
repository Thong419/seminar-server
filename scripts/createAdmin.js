// scripts/createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserCA from '../models/userCA.js';

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
  });
  
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("DB connection successful!"));

const adminExists = await UserCA.findOne({ username: 'admin' });
if (adminExists) {
  console.log('⚠️ Admin already exists');
  process.exit(0);
}

await UserCA.create({
  username: 'admin',
  password: '419532', // sẽ được hash
  displayName: 'Administrator',
  role: 'admin',
});

console.log('✅ Admin created');
process.exit(0);
