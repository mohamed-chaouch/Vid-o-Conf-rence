import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Your user model
import RefreshToken from "../models/RefreshToken.js"; // For storing refresh tokens
// Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};
// Generate Refresh Token
const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
    return refreshToken;
};
export const googleAuth = async (req, res) => {
    const { code, flow } = req.query; // The authorization code from Google
    if (!code) {
        return res.status(400).send("No authorization code received.");
    }
    try {
        // Step 1: Exchange the authorization code for access and refresh tokens
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: `${process.env.BASE_URL}${flow}`,
            grant_type: "authorization_code",
        });
        if (tokenResponse.headers["content-type"] !== "application/json") {
            console.error("Non-JSON response:", tokenResponse.data);
        }
        const { access_token, refresh_token } = tokenResponse.data;
        // Step 2: Get user profile using the access token
        const userProfileResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const { email, name, picture } = userProfileResponse.data;
        // Step 3: Find or create the user in your database
        let user = await User.findOne({ email });
        if (!user) {
            // Create a new user if not found
            user = new User({
                email,
                username: name,
                imageUrl: picture,
            });
            await user.save();
        }
        // Step 4: Generate your custom JWT access and refresh tokens
        const accessToken = generateAccessToken({
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            imageUrl: user.imageUrl,
        });
        const refreshToken = await generateRefreshToken({
            _id: user._id.toString(),
            username: user.username,
            email: user.email,
            imageUrl: user.imageUrl,
        });
        // Step 5: Save the refresh token in a secure cookie (HTTP-only)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: Boolean(process.env.production),
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        // Step 6: Store the refresh token in the database (optional but recommended)
        const refreshTokenExistant = await RefreshToken.findOne({
            userId: user._id,
        });
        if (!refreshTokenExistant) {
            // Create a new instance of the RefreshToken model
            new RefreshToken({
                userId: user._id,
                refreshToken: refreshToken,
                expiration: "30d",
            }).save();
        }
        else {
            // Create a new instance of the RefreshToken model
            await RefreshToken.findOneAndUpdate({
                userId: user._id,
            }, { refreshToken: refreshToken });
        }
        // Step 7: Send the generated access token to the frontend
        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600, // 1 hour
        });
    }
    catch (error) {
        console.error("Error during OAuth token exchange:", error);
        res.status(500).send("Error during OAuth token exchange");
    }
};
export default googleAuth;
