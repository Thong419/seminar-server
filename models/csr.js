import mongoose from 'mongoose';

const csrSchema = new mongoose.Schema({
  commonName: { type: String, required: true },
  organization: { type: String, required: true },
  country: { type: String, required: true, length: 2 },
  organizationalUnit: { type: String },
  state: { type: String },
  locality: { type: String },
  email: { type: String },
  // csrUrl: { type: String },         // ✅ Link download file .csr
  certUrl: { type: String },        // ✅ Link download file .crt
  privateKeyUrl: { type: String },  // ✅ Link download file .key
  createdAt: { type: Date, default: Date.now }
});



export default mongoose.model('CSR', csrSchema);
