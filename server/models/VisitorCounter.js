import mongoose from 'mongoose';

const visitorCounterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'website',
  },
  count: {
    type: Number,
    default: 0,
  },
});

const VisitorCounter = mongoose.model('VisitorCounter', visitorCounterSchema);
export default VisitorCounter;
