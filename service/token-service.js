import "../env.js";
import jwt from "jsonwebtoken";
import tokenModel from "../models/token-model.js";

class TokenService{
    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: "15m"});
        const refreshToken = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: "30d"});
        return {accessToken, refreshToken};
    }

    async saveToken(userId, refreshToken, session){
        const tokenData = session ? await tokenModel.findById(session) : null;

        if(tokenData){
            tokenData.refreshToken = refreshToken;
            return (await tokenData.save()).id;
        }

        const token = await tokenModel.create({user: userId});
        return token.id;
    }

    async removeToken(refreshToken){
        const tokenData = await tokenModel.deleteOne({refreshToken});
        return tokenData;
    }

    validateToken(token){
        try{
            const userData = jwt.verify(token, process.env.SECRET_KEY);
            return userData;
        }catch(e){
            return null;
        }
    }

    async findToken(refreshToken){
        const tokenData = await tokenModel.findOne({refreshToken});
        return tokenData;
    }
}

export default new TokenService();