import { Document, Schema } from "mongoose";

export default interface AttachmentInterface extends Document {
  // listing: Schema.Types.ObjectId;
  name: string;
  type: "audio" | "video" | "picture" | "document" | "other";
  category: "listing" | "promotion";
  key: string;
}
