import userModel from "../models/user-model.js";
import bcrypt from 'bcrypt';
import tokenService from "./token-service.js";
import { ApiError } from "../middle/error.js";

class UserService{
    async registration(username, password){
        const can = await userModel.findOne({username});
        if(can) throw ApiError.BadRequest("User already exists");

        const hash = await bcrypt.hash(password, 3);
        const user = await userModel.create({username, password: hash});
        
        const session = await tokenService.saveToken(user._id);
        const tokens = tokenService.generateTokens({username: user.username, id: user._id, session});
        await tokenService.saveToken(user._id, tokens.refreshToken, session);

        return {...tokens, session};
    }

    async login(username, password){
        const user = await userModel.findOne({username});
        if(!user) throw ApiError.BadRequest("User not found");
        
        const isPass = await bcrypt.compare(password, user.password);
        if(!isPass) throw ApiError.BadRequest("Incorrect password");

        const session = await tokenService.saveToken(user._id);
        const tokens = tokenService.generateTokens({username: user.username, id: user._id, session});
        await tokenService.saveToken(user._id, tokens.refreshToken, session);

        return {...tokens, session};
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if(!refreshToken) throw ApiError.UnauthorizedError();

        const userData = tokenService.validateToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if(!userData || !tokenFromDb) throw ApiError.UnauthorizedError();

        const tokens = tokenService.generateTokens({username: userData.username, id: userData.id, session: userData.session});
        await tokenService.saveToken(userData.id, tokens.refreshToken, userData.session);

        return {...tokens, session: userData.session};
    }

    async getUsers(){
        const users = await userModel.find();
        return users;
    }
}

export default new UserService();