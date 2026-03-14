import mongoose, { Schema, model, models, Document } from "mongoose";

// Interface TypeScript pour le type User
export interface IUser extends Document {
  email: string;
  password?: string;
  role: "ADMIN" | "ARTISAN" | "CLIENT";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  createdAt: Date;
  updatedAt: Date;
}

// Schéma Mongoose typé
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      select: false, // Ne pas renvoyer le mot de passe par défaut
    },
    role: {
      type: String,
      enum: ["ADMIN", "ARTISAN", "CLIENT"],
      default: "CLIENT",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "PENDING"],
      default: "PENDING",
    },
  },
  {
    timestamps: true, // Gère automatiquement createdAt et updatedAt
  }
);

// Exportation du modèle compatible avec le Hot Reload de Next.js
const User = models.User || model<IUser>("User", UserSchema);

export default User;
