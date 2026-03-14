import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IAnnonce extends Document {
  clientId: Types.ObjectId;
  titre: string;
  description: string;
  categoryId: Types.ObjectId;
  ville: string;
  budget: number;
  images: string[]; // Liste d'URLs Cloudinary
  statut: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

const AnnonceSchema = new Schema<IAnnonce>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titre: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
      maxlength: [100, "Le titre est trop long"],
    },
    description: {
      type: String,
      required: [true, "La description est obligatoire"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    ville: {
      type: String,
      required: [true, "La ville est obligatoire"],
    },
    budget: {
      type: Number,
      required: true,
      min: [0, "Le budget ne peut pas être négatif"],
    },
    images: {
      type: [String],
      default: [],
    },
    statut: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "CLOSED"],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

// Indexation pour des recherches ultra-rapides
AnnonceSchema.index({ ville: 1, categoryId: 1, statut: 1 });
AnnonceSchema.index({ titre: "text", description: "text" });

const Annonce = models.Annonce || model<IAnnonce>("Annonce", AnnonceSchema);

export default Annonce;
