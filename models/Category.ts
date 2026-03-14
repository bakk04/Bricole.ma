import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ICategory extends Document {
  nom: string;
  description?: string;
  iconUrl?: string; // Stockera l'URL Cloudinary
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    nom: {
      type: String,
      required: [true, "Le nom de la catégorie est requis"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    iconUrl: {
      type: String,
      default: "https://res.cloudinary.com/dr2fjkaye/image/upload/v1/default-icon.png",
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pour nettoyer le cache Redis lors d'une modification
CategorySchema.post("save", async function() {
  const { cache } = await import("@/lib/redis");
  await cache.del("categories:all");
});

const Category = models.Category || model<ICategory>("Category", CategorySchema);

export default Category;
