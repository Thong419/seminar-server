import Cert from '../models/certModel.js';

export const createCert = async (req, res) => {
  try {
    const cert = await Cert.create(req.body);
    res.status(201).json({ status: 'success', data: cert });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const getAllCerts = async (req, res) => {
  const certs = await Cert.find().populate('signedBy');
  res.status(200).json({ status: 'success', results: certs.length, data: certs });
};

export const getCert = async (req, res) => {
  const cert = await Cert.findById(req.params.id).populate('signedBy');
  if (!cert) return res.status(404).json({ status: 'fail', message: 'Cert not found' });
  res.status(200).json({ status: 'success', data: cert });
};
