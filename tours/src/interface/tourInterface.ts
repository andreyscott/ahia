import { Document } from "mongoose";

export default interface TourInterface extends Document {
  realtorId?: string;
  customerId?: string;
  listingIds: string[];
  scheduledDate?: Date;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
}
