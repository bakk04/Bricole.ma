import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IMission extends Document {
  clientId: Types.ObjectId;
  artisanId: Types.ObjectId;
  productId: Types.ObjectId;
  titre: string;
  description: string;
  prix: number;
  statut: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema = new Schema<IMission>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    artisanId: {
      type: Schema.Types.ObjectId,
      ref: "ArtisanProfile",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "ProductService",
      required: true,
    },
    titre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    prix: {
      type: Number,
      required: true,
    },
    statut: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

MissionSchema.index({ artisanId: 1, statut: 1 });
MissionSchema.index({ clientId: 1, statut: 1 });

const Mission = models.Mission || model<IMission>("Mission", MissionSchema);

export default Mission;
