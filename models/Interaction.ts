import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IInteraction extends Document {
  clientId?: Types.ObjectId; // Optionnel (visiteur anonyme)
  targetId: Types.ObjectId;
  targetType: "ARTISAN" | "PRODUCT";
  type: "VIEW" | "CLICK" | "FAVORITE" | "CONTACT";
  createdAt: Date;
}

const InteractionSchema = new Schema<IInteraction>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "User" },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ["ARTISAN", "PRODUCT"], required: true },
    type: { type: String, enum: ["VIEW", "CLICK", "FAVORITE", "CONTACT"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Pour des analytiques ultra-rapides, indexation par type et cible
InteractionSchema.index({ targetId: 1, type: 1 });

const Interaction = models.Interaction || model<IInteraction>("Interaction", InteractionSchema);
export default Interaction;
