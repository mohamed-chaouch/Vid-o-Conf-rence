import { User } from "../models/User.js"; // Adjust the import based on the actual location of your User type

declare global {
  namespace Express {
    interface Request {
      user?: User; // This is how you add user to the Request object
    }
  }
}
