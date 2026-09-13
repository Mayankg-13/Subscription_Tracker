import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import { sendRenewalEmail } from '../utils/sendEmail.js';
import { advanceRenewalDate } from '../utils/billing.js';

export const runReminderJob = async () => {
  let remindersSent = 0;
  let datesAdvanced = 0;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeSubscriptions = await Subscription.find({ status: 'active' }).populate('user');

    for (const sub of activeSubscriptions) {
      if (!sub.user || !sub.user.remindersEnabled) {
        continue;
      }

      const reminderCutoff = new Date(today);
      reminderCutoff.setDate(reminderCutoff.getDate() + sub.reminderDaysBefore);
      reminderCutoff.setHours(23, 59, 59, 999);

      const subRenewalDate = new Date(sub.nextRenewalDate);

      const isWithinWindow = subRenewalDate >= today && subRenewalDate <= reminderCutoff;
      const notSentYet =
        !sub.lastReminderSentFor ||
        new Date(sub.lastReminderSentFor).getTime() !== subRenewalDate.getTime();

      if (isWithinWindow && notSentYet) {
        const emailSent = await sendRenewalEmail({
          to: sub.user.email,
          subscriptionName: sub.name,
          amount: sub.amount,
          renewalDate: sub.nextRenewalDate,
        });

        if (emailSent) {
          sub.lastReminderSentFor = sub.nextRenewalDate;
          await sub.save();
          remindersSent++;
        }
      }
    }

    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      nextRenewalDate: { $lt: today },
    });

    for (const sub of expiredSubscriptions) {
      const newRenewalDate = advanceRenewalDate(sub);
      sub.nextRenewalDate = newRenewalDate;
      await sub.save();
      datesAdvanced++;
    }

    return { remindersSent, datesAdvanced };
  } catch (error) {
    console.error(`[Cron Job Error] Failed executing reminder job: ${error.message}`);
    throw error;
  }
};

export const initCronJob = () => {
  cron.schedule('0 9 * * *', () => {
    runReminderJob();
  });
};
