import process from "node:process";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const Config = {
  APP_SECRET: process.env.APP_SECRET || "",
  AWS: {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    S3_BUCKET: {
      NAME: process.env.AWS_S3_BUCKET_NAME || "",
      KEY: process.env.AWS_S3_BUCKET_KEY || "",
    },
    REGION: process.env.AWS_REGION || "af-south-1",
  },
  GOOGLE_MAP_API: {
    GEOCODE_URL: process.env.GOOGLE_MAP_API_GEOCODE_URL,
    PLACE_URL: process.env.GOOGLE_MAP_API_PLACE_URL,
    KEY: process.env.GOOGLE_MAP_API_KEY,
  },
  LISTING: {
    ADMIN_EMAIL_I: process.env.LISTING_ADMIN_EMAIL_I || "",
    ADMIN_EMAIL_II: process.env.LISTING_ADMIN_EMAIL_II || "",
    SERVICE: {
      NAME: process.env.LISTING_SERVICE_NAME || "",
      SECRET: process.env.LISTING_SERVICE_SECRET || "",
    },
  },
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "test",
  PAYMENT_SERVICE_URL:
    process.env.PAYMENT_SERVICE_URL || "127.0.0.1:6999/api/v1/payments",
  PORT: {
    HTTP: process.env.HTTP_PORT || 4999,
    HTTPS: process.env.HTTPS_PORT || 5000,
  },
  SSL: {
    KEY_FILE_PATH: process.env.SSL_KEY_FILE_PATH || "",
    CERT_FILE_PATH: process.env.SSL_CERT_FILE_PATH || "",
  },
};

export default Config;
