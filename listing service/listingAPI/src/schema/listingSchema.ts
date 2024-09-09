import { Schema } from "mongoose";
import slugify from "slugify";
import ListingInterface from "../interface/listingInterface";
import ListingMethodType from "../type/listingmethodType";
import ListingMethodInterface from "../interface/listingmethodInterface";
import OfferingInterface from "../interface/offeringInterface";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing`;

const ListingSchema: Schema<
  ListingInterface,
  ListingMethodType,
  ListingMethodInterface
> = new Schema(
  {
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
      unique: true,
      required: false,
    },
    purpose: {
      type: String,
      enum: ["lease", "sell", "reservation"],
      set: (value: string) => value.toLowerCase(),
      required: true,
    },
    type: {
      type: String,
      enum: ["economy", "premium", "luxury"],
      set: (value: string) => value.toLowerCase(),
      required: true,
    },
    category: {
      type: String,
      enum: ["residential", "commercial", "mixed"],
      set: (value: string) => value.toLowerCase(),
      required: true,
    },
    offerings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        default: undefined,
      },
    ],
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
    provider: {
      id: {
        type: String,
        // required: true,
        required: false,
      },
      email: {
        type: String,
        // required: true,
        required: false,
      },
    },
    media: {
      picture: {
        type: String,
        get: (value: string) => `${baseStoragePath}${value}`,
        required: false,
      },
      video: {
        type: String,
        get: (value: string) => `${baseStoragePath}${value}`,
        required: false,
      },
    },
    verify: {
      status: {
        type: Boolean,
        enum: [true, false],
        default: false,
        required: false,
      },
      expiry: {
        type: Date,
        default: function () {
          return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString();
        },
        required: false,
      },
    },
  },
  { timestamps: true, discriminatorKey: "purpose" }
);

// Listing Schema Search Query Index
ListingSchema.index({
  name: "text",
  description: "text",
  location: "2dsphere",
});

// Listing Schema Middleware
ListingSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

// Listing Schema Instance Method
ListingSchema.method("fetchOfferings", async function fetchOfferings(): Promise<
  OfferingInterface[]
> {
  const listing = this;

  await listing.populate("offerings");

  return listing.offerings;
});

export default ListingSchema;
