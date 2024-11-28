import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface representing a document in MongoDB.
interface IRefreshToken extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  refreshToken: string;
  expiration: string;
}

// Create a Schema corresponding to the document interface.
const refreshTokenSchema: Schema<IRefreshToken> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      unique: true,
      required: true,
    },
    expiration: {
      type: String,
      required: false,
    },

  },
  { timestamps: true }
);

// Create a Model.
const RefreshToken: Model<IRefreshToken> = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export default RefreshToken;
