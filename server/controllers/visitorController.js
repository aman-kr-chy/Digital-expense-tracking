import VisitorCounter from '../models/VisitorCounter.js';

export const recordWebsiteVisit = async (req, res) => {
  try {
    const counter = await VisitorCounter.findOneAndUpdate(
      { key: 'website' },
      { $inc: { count: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ count: counter.count });
  } catch (error) {
    res.status(500).json({ message: 'Could not update visitor count' });
  }
};
