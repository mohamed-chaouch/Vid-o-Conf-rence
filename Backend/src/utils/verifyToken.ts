import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";

dotenv.config();

export const verifyToken = (req : Request, res : Response, next: NextFunction) =>{
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);

    const accessToken = authHeader.split(' ')[1];

    console.log(authHeader, " : authHeader");
    console.log(accessToken, " : accessToken");
    
    jwt.verify(
        accessToken, 
        process.env.ACCESS_TOKEN_SECRET as string, 
        (err : any, decoded: any) => {
            if (err) return res.sendStatus(403); //invalid token
            req.user = decoded;
            next();
        }
    )
}