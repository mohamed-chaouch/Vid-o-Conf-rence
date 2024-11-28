import mongoose from "mongoose";
mongoose.connect(process.env.MongoDB_URL)
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((err) => {
    console.error("Error connecting to MongoDB", err);
});
export default mongoose;
