import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
    try{
        const hashPassword : string = await bcrypt.hash(password, 10);
        return hashPassword;
    }catch(e){
        throw new Error("Error hashing password");
    }
}