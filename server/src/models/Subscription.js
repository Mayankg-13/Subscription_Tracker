import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Entertainment', 'Education', 'Utilities', 'Health', 'Software', 'Other'],
      default: 'Other',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be greater than or equal to 0'],
    },
    billingCycle: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      required: [true, 'Billing cycle is required'],
    },
    nextRenewalDate: {
      type: Date,
      required: [true, 'Next renewal date is required'],
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
    reminderDaysBefore: {
      type: Number,
      default: 3,
      min: [0, 'Reminder days must be at least 0'],
      max: [30, 'Reminder days cannot exceed 30'],
    },
    lastReminderSentFor: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1, status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
