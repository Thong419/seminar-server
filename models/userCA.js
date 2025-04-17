// models/UserCA.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userCASchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Tên đăng nhập
  password: { type: String, required: true }, // Được hash
  fullName: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

// Middleware để mã hóa password trước khi lưu
userCASchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức so sánh mật khẩu
userCASchema.methods.comparePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

export default mongoose.model('UserCA', userCASchema);

