import express from 'express';
import { body } from 'express-validator';
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionStats,
  getUpcomingSubscriptions,
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

const subscriptionValidation = [
  body('name').trim().notEmpty().withMessage('Subscription name is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('billingCycle')
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('Billing cycle must be weekly, monthly, or yearly'),
  body('nextRenewalDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid next renewal date'),
  body('category')
    .optional()
    .isIn(['Entertainment', 'Education', 'Utilities', 'Health', 'Software', 'Other'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['active', 'cancelled'])
    .withMessage('Status must be active or cancelled'),
  body('reminderDaysBefore')
    .optional()
    .isInt({ min: 0, max: 30 })
    .withMessage('Reminder days must be between 0 and 30'),
];

router.get('/', getSubscriptions);
router.post('/', subscriptionValidation, createSubscription);

router.get('/stats', getSubscriptionStats);
router.get('/upcoming', getUpcomingSubscriptions);

router.get('/:id', getSubscriptionById);
router.put('/:id', subscriptionValidation, updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
