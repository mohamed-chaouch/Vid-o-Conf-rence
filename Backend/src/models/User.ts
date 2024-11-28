import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface representing a document in MongoDB.
interface IUser extends Document {
  username: string;
  email: string;
  imageUrl: string;
  password: string;
}

// Create a Schema corresponding to the document interface.
const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true }
);

// Create a Model.
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
