import express from 'express';
import { runReminderJob } from '../jobs/reminderJob.js';

const router = express.Router();

router.post('/run-reminders', async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Dev endpoint disabled in production' });
  }

  try {
    const result = await runReminderJob();
    return res.json({
      message: 'Reminder job triggered successfully',
      result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
