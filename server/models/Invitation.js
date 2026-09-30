import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED'],
    default: 'PENDING',
  }
}, {
  timestamps: true,
});

const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;
