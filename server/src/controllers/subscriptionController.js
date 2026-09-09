import { validationResult } from 'express-validator';
import Subscription from '../models/Subscription.js';

export const getSubscriptions = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;

    const query = { user: req.user._id };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const subscriptions = await Subscription.find(query).sort({ nextRenewalDate: 1 });
    return res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    return res.json(subscription);
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const {
      name,
      category,
      amount,
      billingCycle,
      nextRenewalDate,
      status,
      reminderDaysBefore,
      notes,
    } = req.body;

    const subscription = await Subscription.create({
      user: req.user._id,
      name,
      category,
      amount,
      billingCycle,
      nextRenewalDate,
      status,
      reminderDaysBefore,
      notes,
    });

    return res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const fieldsToUpdate = [
      'name',
      'category',
      'amount',
      'billingCycle',
      'nextRenewalDate',
      'status',
      'reminderDaysBefore',
      'notes',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        subscription[field] = req.body[field];
      }
    });

    const updatedSubscription = await subscription.save();
    return res.json(updatedSubscription);
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    return res.json({ message: 'Subscription removed' });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStats = async (req, res, next) => {
  try {
    const categoryStats = await Subscription.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'active',
        },
      },
      {
        $addFields: {
          monthlyAmount: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$billingCycle', 'weekly'] },
                  then: { $divide: [{ $multiply: ['$amount', 52] }, 12] },
                },
                {
                  case: { $eq: ['$billingCycle', 'yearly'] },
                  then: { $divide: ['$amount', 12] },
                },
                {
                  case: { $eq: ['$billingCycle', 'monthly'] },
                  then: '$amount',
                },
              ],
              default: '$amount',
            },
          },
        },
      },
      {
        $group: {
          _id: '$category',
          monthlyTotal: { $sum: '$monthlyAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          monthlyTotal: { $round: ['$monthlyTotal', 2] },
          count: 1,
        },
      },
    ]);

    let activeCount = 0;
    let totalMonthly = 0;

    const byCategory = categoryStats.map((item) => {
      activeCount += item.count;
      totalMonthly += item.monthlyTotal;
      return item;
    });

    totalMonthly = Math.round(totalMonthly * 100) / 100;
    const totalYearly = Math.round(totalMonthly * 12 * 100) / 100;

    return res.json({
      totalMonthly,
      totalYearly,
      activeCount,
      byCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingSubscriptions = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    const upcoming = await Subscription.find({
      user: req.user._id,
      status: 'active',
      nextRenewalDate: {
        $gte: today,
        $lte: next7Days,
      },
    }).sort({ nextRenewalDate: 1 });

    return res.json(upcoming);
  } catch (error) {
    next(error);
  }
};
