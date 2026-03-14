import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IReview extends Document {
  clientId: Types.ObjectId;
  artisanId: Types.ObjectId;
  note: number;
  commentaire: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    artisanId: { type: Schema.Types.ObjectId, ref: "ArtisanProfile", required: true },
    note: { type: Number, required: true, min: 1, max: 5 },
    commentaire: { type: String, required: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ artisanId: 1, note: -1 });

const Review = models.Review || model<IReview>("Review", ReviewSchema);
export default Review;
