import express from 'express';
import { getFriends, sendFriendRequest, updateFriendRequest, removeFriend, getFriendRequests, inviteFriendByEmail, getInvitationDetails } from '../controllers/friendController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getFriends);
  
router.route('/request')
  .post(protect, sendFriendRequest);

router.route('/requests')
  .get(protect, getFriendRequests);

router.route('/request/:id')
  .put(protect, updateFriendRequest);

router.route('/:id')
  .delete(protect, removeFriend);

router.route('/invite')
  .post(protect, inviteFriendByEmail);

router.route('/invite/:token')
  .get(getInvitationDetails);

export default router;
