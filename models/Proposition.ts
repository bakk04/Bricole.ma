import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IProposition extends Document {
  annonceId: Types.ObjectId;
  artisanId: Types.ObjectId;
  message: string;
  prixPropose: number;
  statut: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const PropositionSchema = new Schema<IProposition>(
  {
    annonceId: { type: Schema.Types.ObjectId, ref: "Annonce", required: true },
    artisanId: { type: Schema.Types.ObjectId, ref: "ArtisanProfile", required: true },
    message: { type: String, required: true },
    prixPropose: { type: Number, required: true },
    statut: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

PropositionSchema.index({ annonceId: 1, statut: 1 });

const Proposition = models.Proposition || model<IProposition>("Proposition", PropositionSchema);
export default Proposition;
