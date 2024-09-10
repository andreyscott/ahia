import { Schema } from "mongoose";

export default interface IPromotion {
  type: string;
  description: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  listings?: Schema.Types.ObjectId;
  offerings?: Schema.Types.ObjectId[];
}
