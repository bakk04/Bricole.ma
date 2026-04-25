/**
 * Core Types for Bricole.ma
 */

export type UserRole = "ADMIN" | "ARTISAN" | "CLIENT";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";
export type AnnonceStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export interface GPSCoordinates {
  lat: number;
  lng: number;
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  prenom?: string;
  nom?: string;
  nomEntreprise?: string;
  telephone?: string;
  ville?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  image?: string;
  profileImage?: string;
  urlToken?: string;
  artisanType?: string;
  domaine?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Category {
  _id: string;
  nom: string;
  description?: string;
  iconUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ArtisanProfile {
  _id: string;
  userId: string | User;
  nomComplet: string;
  nomEntreprise?: string;
  telephone: string;
  ville: string;
  adresse?: string;
  metierId: string | Category;
  description: string;
  photoProfil?: string;
  noteMoyenne: number;
  estVerifie: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Annonce {
  _id: string;
  clientId: string | User;
  titre: string;
  description: string;
  categoryId: string | Category;
  ville: string;
  budget: number;
  images: string[];
  statut: AnnonceStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Review {
  _id: string;
  artisanId: string;
  clientId: string | User;
  note: number;
  commentaire: string;
  createdAt?: string | Date;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt?: string | Date;
}
