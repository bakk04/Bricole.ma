import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IArtisanProfile extends Document {
  userId: Types.ObjectId;
  nomComplet: string;
  nomEntreprise?: string;
  telephone: string;
  ville: string;
  adresse?: string;
  metierId: Types.ObjectId; // Référence à Category (catégorie principale)
  description: string;
  photoProfil?: string; // URL Cloudinary
  noteMoyenne: number;
  estVerifie: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArtisanProfileSchema = new Schema<IArtisanProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    nomComplet: {
      type: String,
      required: [true, "Le nom complet est obligatoire"],
      trim: true,
    },
    nomEntreprise: {
      type: String,
      trim: true,
    },
    telephone: {
      type: String,
      required: [true, "Le numéro de téléphone est obligatoire"],
    },
    ville: {
      type: String,
      required: true,
    },
    adresse: {
      type: String,
    },
    metierId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photoProfil: {
      type: String,
      default: "https://res.cloudinary.com/dr2fjkaye/image/upload/v1/default-avatar.png",
    },
    noteMoyenne: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    estVerifie: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexation pour la recherche d'artisans par ville et métier
ArtisanProfileSchema.index({ ville: 1, metierId: 1, noteMoyenne: -1 });
ArtisanProfileSchema.index({ nomComplet: "text", nomEntreprise: "text" });

// Invalidation du cache Redis pour ce profil spécifique lors d'une mise à jour
ArtisanProfileSchema.post("save", async function() {
  const { cache } = await import("@/lib/redis");
  await cache.del(`artisan:${this.userId}`);
  await cache.del(`artisan:${this._id}`);
});

const ArtisanProfile = models.ArtisanProfile || model<IArtisanProfile>("ArtisanProfile", ArtisanProfileSchema);

export default ArtisanProfile;
