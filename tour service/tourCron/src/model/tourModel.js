const mongoose = require("mongoose");

const TourSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    customer: {
      id: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    listings: [
      {
        id: {
          type: String,
          required: true,
        },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            required: true,
          },
          coordinates: {
            type: [Number],
            required: true,
          },
        },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
    realtor: {
      id: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
    },
    schedule: {
      date: {
        type: Date,
        required: false,
      },
      time: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Tour = mongoose.model("Tour", TourSchema);

module.exports = Tour;
