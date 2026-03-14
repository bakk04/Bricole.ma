import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IFavorite extends Document {
  clientId: Types.ObjectId;
  artisanId?: Types.ObjectId;
  productId?: Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    artisanId: { type: Schema.Types.ObjectId, ref: "ArtisanProfile" },
    productId: { type: Schema.Types.ObjectId, ref: "ProductService" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FavoriteSchema.index({ clientId: 1, artisanId: 1, productId: 1 }, { unique: true });

const Favorite = models.Favorite || model<IFavorite>("Favorite", FavoriteSchema);
export default Favorite;
