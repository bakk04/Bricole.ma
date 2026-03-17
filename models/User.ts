import mongoose, { Schema, model, models, Document } from "mongoose";

// Interface TypeScript pour le type User
export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  prenom?: string;
  nom?: string;
  nomEntreprise?: string;
  telephone?: string;
  ville?: string;
  role: "ADMIN" | "ARTISAN" | "CLIENT";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  verificationToken?: string;
  isVerified: boolean;
  image?: string;
  profileImage?: string;
  artisanType?: string;
  domaine?: string;
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
    name: {
      type: String,
      required: false,
    },
    prenom: {
        type: String,
        required: false,
    },
    nom: {
        type: String,
        required: false,
    },
    nomEntreprise: {
        type: String,
        required: false,
    },
    telephone: {
        type: String,
        required: false,
    },
    ville: {
        type: String,
        required: false,
    },
    image: {
      type: String,
      required: false,
    },
    profileImage: {
        type: String,
        required: false,
    },
    password: {
      type: String,
      required: false,
      select: false,
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: false,
    },
    artisanType: {
        type: String,
        required: false,
    },
    domaine: {
        type: String,
        required: false,
    },
  },
  {
    timestamps: true, // Gère automatiquement createdAt et updatedAt
    collection: "Users", // Forcer le nom de la collection pour correspondre à l'existant
    strict: false, // Permettre d'autres champs si nécessaire
  }
);

// Exportation du modèle compatible avec le Hot Reload de Next.js
const User = models.User || model<IUser>("User", UserSchema);

export default User;
