const MapCache = require("./cache");
const SendEmail = require("./mailer");
const NotifyAdmin = require("./notificationHandler");
const RetryHandler = require("./retryHandler");

const failureCache = new MapCache();

class TourNotificationTransactionManager {
  static async processTourNotification(customer, realtor, tourDate, tourTime) {
    let customerEmail = customer.email;

    let realtorEmail = realtor.email;

    try {
      if (!customerEmail) {
        throw new Error(`Email not found for customer: ${customer.id}`);
      }

      if (!realtorEmail) {
        throw new Error(`Email not found for realtor: ${realtor.id}`);
      }

      const subject = "Tour Reminder";

      const text = `You have a scheduled tour on ${tourDate.toDateString()} at ${tourTime}.`;

      await RetryHandler.LinearJitterRetry(() =>
        SendEmail("", [customerEmail], subject, text, "", [realtorEmail])
      );
    } catch (err) {
      console.error(
        `Failed to process transaction for customer ${customer.id} and realtor ${realtor.id}: ${err.message}`
      );

      await NotifyAdmin();

      failureCache.set(customer.id, {
        customer: customer.email,
        realtor: realtor.email,
        tourDate: tourDate,
        tourTime: tourTime,
      });
    }
  }

  static async retryFailureCache() {
    let retriedCount = 0;

    for (const [key, value] of failureCache.entries()) {
      await this.processTourNotification(
        value.customer,
        value.realtor,
        value.tourDate,
        value.tourTime
      );

      retriedCount++;

      failureCache.delete(key);
    }

    return retriedCount;
  }
}

module.exports = TourNotificationTransactionManager;
