import { Schema } from "mongoose";
import ListingInterface from "../interface/listingInterface";
import { nanoid } from "nanoid";
import slugify from "slugify";

const ListingSchema: Schema<ListingInterface> = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["rent", "sell"],
    required: true,
  },
  type: {
    type: String,
    enum: ["developed", "ongoing", "undeveloped"],
    required: true,
  },
  category: {
    type: String,
    enum: ["economy", "premium", "luxury"],
    required: true,
  },
  use: {
    type: {
      type: String, // "single-room" | "mini-flat" | "2-bedroom-flat" | "3-bedroom-flat" | "duplex" | "semi-detached" | "short-lets" | "office" | "shop" | "event-halls" | "bare-land";
      required: true,
    },
    category: {
      type: String,
      enum: ["residential", "commercial"],
      required: true,
    },
  },
  features: [
    {
      type: String, // landmark features
      required: true,
    },
  ],
  address: {
    street: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    countyLGA: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: {
      type: Number,
      required: false,
    },
  },
  promotion: [
    {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: false,
    },
  ],
  attachment: [
    {
      type: Schema.Types.ObjectId,
      ref: "Attachment",
      required: false,
    },
  ],
  provider: {
    type: String,
    required: true,
  },
  reference: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    expiry: {
      type: Date,
      default: function () {
        return Date.now() + 3 * 24 * 60 * 60 * 1000;
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ListingSchema.index({ location: "2dsphere" });

ListingSchema.pre("save", function (next) {
  if (!this.isModified("slug")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

ListingSchema.pre("save", function (next) {
  if (!this.isModified("reference")) {
    this.reference.id = nanoid();
  }

  next();
});

export default ListingSchema;
