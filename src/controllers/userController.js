import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const createToken = async (id, email) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT Secret Key Is Missing!");
    }
    const token = await jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "1D" });
    return token;
}

const cookiesOption = {
    httpOnly: true,
    secure: false,
    // satisfies: "Strict",
    maxAge: 60 * 60 * 24 * 1000
}
export const signUp = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        if (!email || !password || !name) {
            return res.status(422).json({
                message: "Please Fill All Required Field!"
            })
        }

        // check user already exists or not?
        const user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({
                message: "Email Id Already Exist"
            })
        }

        // password hash
        const hashPassword = await bcrypt.hash(password, 10);

        const userCreate = await User.create({
            name,
            email,
            age,
            password: hashPassword
        })

        // create token
        const token = await createToken(userCreate._id, email);
        // send cookie
        res.cookie('token', token, cookiesOption);

        return res.status(201).json({
            message: "User Created Successfully",
            name,
            age,
            email
        })
    } catch (error) {
        console.log("Error In Sign Up :- ", error);
        return res.status(500).json({
            message: "Internal Server Error!"
        })
    }
}
export const logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({
                message: "Please Fill All Required Field!"
            })
        }

        // check user already exists or not?
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User Not Found"
            })
        }

        // password hash check
        const isMatchPassword = await bcrypt.compare(password, user.password);
        // 
        if (!isMatchPassword) {
            return res.status(401).json({
                message: "Incorrect Password"
            })
        }

        // create token
        const token = await createToken(user._id, email);
        // send cookie
        res.cookie('token', token, cookiesOption);

        return res.status(200).json({
            message: "User LogIn Successfully",
            email,
            name: user.name,
            age: user.age,
            usage: user.usage
        })
    } catch (error) {
        console.log("Error In LogIn :- ", error);
        return res.status(500).json({
            message: "Internal Server Error!"
        })
    }
}
export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false
        })
        return res.status(200).json({
            message: "User LoggedOut Successfully."
        })
    } catch (error) {
        console.log("Error While LogOut", error.message);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
export const profile = async (req, res) => {
    try{
        res.status(200).json({
            name: req.user.name,
            age: req.user.age,
            email: req.user.email,
            usage: req.user.usage, 
        })
    }catch(error){
        console.log("Error While Profile Find ", error.message);
        return res.status(500).json({
            message: "Internal Server Error!"
        })
    }
}