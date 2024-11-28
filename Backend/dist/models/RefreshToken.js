import mongoose, { Schema } from 'mongoose';
// Create a Schema corresponding to the document interface.
const refreshTokenSchema = new Schema({
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
}, { timestamps: true });
// Create a Model.
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
