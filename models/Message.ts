import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  lu: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    lu: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Message = models.Message || model<IMessage>("Message", MessageSchema);
export default Message;
