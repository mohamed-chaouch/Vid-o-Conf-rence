import mongoose, { Schema } from 'mongoose';
// Create a Schema corresponding to the document interface.
const userSchema = new Schema({
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
}, { timestamps: true });
// Create a Model.
const User = mongoose.model('User', userSchema);
export default User;
