import CA from '../models/caModel.js';

export const createCA = async (req, res) => {
  try {
    const ca = await CA.create(req.body);
    res.status(201).json({ status: 'success', data: ca });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const getAllCAs = async (req, res) => {
  const cas = await CA.find();
  res.status(200).json({ status: 'success', results: cas.length, data: cas });
};

export const getCA = async (req, res) => {
  const ca = await CA.findById(req.params.id);
  if (!ca) return res.status(404).json({ status: 'fail', message: 'CA not found' });
  res.status(200).json({ status: 'success', data: ca });
};
