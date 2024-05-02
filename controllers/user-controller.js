import userService from "../service/user-service.js";

class UserController{
    async registration(req, res, next){
        try{
            const {username, password} = req.body;
            const userData = await userService.registration(username, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie('session', userData.session, {httpOnly: true});
            return res.json(userData);
        }catch(e){
            next(e);
        }
    }

    async login(req, res, next){
        try{
            const {username, password} = req.body;
            const userData = await userService.login(username, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            res.cookie('session', userData.session, {httpOnly: true});
            return res.json(userData);
        }catch(e){
            next(e);
        }
    }

    async logout(req, res, next){
        try{
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            res.clearCookie('session');
            return res.json(token);
        }catch(e){
            next(e);
        }
    }

    async refresh(req, res, next){
        try{
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        }catch(e){
            next(e);
        }
    }
}

export default new UserController();