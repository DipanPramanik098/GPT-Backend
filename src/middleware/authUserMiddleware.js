import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


const authUserMiddleware = async (req, res, next) => {
    try {

        // get token from cookie
        const { token } = req.cookies;

        // verify token
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        //check user
        const existingUser = await User.findById(payload.id);
        if(!existingUser){
            return res.status(404).json({
                message: "User Does Not Exist."
            })
        }
        req.user = existingUser;
        return next();
    } catch (error) {
        console.log('Auth MiddleWare Error ', error);
        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
}

export default authUserMiddleware;