import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.sendStatus(401);
    const accessToken = authHeader.split(' ')[1];
    console.log(authHeader, " : authHeader");
    console.log(accessToken, " : accessToken");
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err)
            return res.sendStatus(403); //invalid token
        req.user = decoded;
        next();
    });
};
