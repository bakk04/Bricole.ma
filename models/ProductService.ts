import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IProductService extends Document {
  artisanId: Types.ObjectId;
  categoryId: Types.ObjectId;
  titre: string;
  description: string;
  prix: number;
  images: string[]; // URLs Cloudinary
  createdAt: Date;
  updatedAt: Date;
}

const ProductServiceSchema = new Schema<IProductService>(
  {
    artisanId: {
      type: Schema.Types.ObjectId,
      ref: "ArtisanProfile",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    prix: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ProductServiceSchema.index({ artisanId: 1, categoryId: 1 });

const ProductService = models.ProductService || model<IProductService>("ProductService", ProductServiceSchema);

export default ProductService;
