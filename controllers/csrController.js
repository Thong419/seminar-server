import CSR from '../models/csr.js';
import { generateCSRAndCert } from '../services/csrService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export const createCSR = async (req, res) => {
  try {
    const {
      commonName,
      organization,
      organizationalUnit,
      country,
      state,
      locality,
      email
    } = req.body;

    // Check if csr already exists for the same commonName
    const existingCSR = await CSR.findOne({ commonName });
    if (existingCSR) {
      return res.status(400).json({ error: 'CSR with this Common Name already exists.' });
    }

    const { urls } = generateCSRAndCert(req.body);

    const newCSR = new CSR({
      commonName,
      organization,
      organizationalUnit,
      country,
      state,
      locality,
      email,
      // csrUrl: urls.csrUrl,
      certUrl: urls.certUrl,
      privateKeyUrl: urls.privateKeyUrl
    });

    await newCSR.save();

    res.json({
      message: 'CSR và Certificate đã tạo thành công.',
      downloadLinks: urls,
      newCSR: newCSR
    });
  } catch (err) {
    console.error('Lỗi tạo CSR:', err);
    res.status(500).json({ error: 'Không thể tạo CSR.' });
  }
};
export const getAllCSRs = async (req, res) => {
  try {
    const csrs = await CSR.find().sort({ createdAt: -1 });
    console.log('Fetched CSRs:', csrs);
    res.json(csrs);
  } catch (error) {
    console.error('Error fetching CSRs:', error);
    res.status(500).json({ error: 'Server error while fetching CSRs' });
  }
};


export const downloadCSRFile = async (req, res) => {
  try {
    const { url } = req.body; // url là đường dẫn TƯƠNG ĐỐI từ client gửi

    console.log('Received URL:', url);

    // Chuyển đổi đường dẫn tương đối thành đường dẫn tuyệt đối
    const filePath = path.join(process.cwd(),"secrets", url); // Đường dẫn tuyệt đối đến file

    console.log('Downloading file:', filePath);

    res.download(filePath); // Tự set headers đúng
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during download' });
  }
};

// const deleteAllCSRs = async ()=> {
//   try {
//     await CSR.deleteMany({});
//     console.log('All CSRs deleted successfully');
//   } catch (error) {
//     console.error('Error deleting CSRs:', error);
//   }
// }

// deleteAllCSRs()