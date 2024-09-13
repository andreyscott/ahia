import { Schema } from "mongoose";
import IPromotion from "../interface/IPromotion";
import PromotionInterfaceType from "../type/promotioninterfaceType";
import PromotionInterface from "../interface/promotionInterface";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/promotions`;

const PromotionSchema: Schema<
  IPromotion,
  PromotionInterfaceType,
  PromotionInterface
> = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    media: {
      picture: {
        type: [String],
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        required: false,
      },
      video: {
        type: [String],
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        required: false,
      },
    },
    listings: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      default: undefined,
    },
    offerings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        default: undefined,
      },
    ],
  },
  { timestamps: true }
);

// Promotion Schema Search Query Index
PromotionSchema.index({ startDate: 1, endDate: 1 });

// Promotion Schema Instance Methods
PromotionSchema.method(
  "checkPromotionValidity",
  function checkPromotionValidity(date: Date = new Date()): boolean {
    return this.startDate <= date && this.endDate >= date;
  }
);

PromotionSchema.method(
  "reactivatePromotion",
  async function reactivatePromotion(
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    this.startDate = this.startDate <= startDate ? startDate : this.startDate;

    this.endDate = this.endDate <= endDate ? endDate : this.endDate;

    if (this.startDate === startDate && this.endDate === endDate)
      await this.save();

    throw new Error("Invalid Arguments Exception");
  }
);

export default PromotionSchema;
