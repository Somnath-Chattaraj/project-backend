import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export const resgisterUser = async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).json({ message: "Email and password are required!" });
        return;
    }   
    const {
        email,
        password
    } = req.body;
    try {
    const existeduser = await prisma.user.findFirst({
        // @ts-ignore
        where: {
            email: email
        }
    })
    if (existeduser) {
        res.status(409).json({ message: "User already existed!" });
        return;
    }
    const hassedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
        email: req.body.email,
        password: hassedPassword,
        },
    });
    if (process.env.SECRET === undefined) {
        res.status(500).json({ message: "Internal server error!" });
        return;
    }
    const exp = Date.now() + 1000 * 60 * 5;
    const token = jwt.sign({ sub: user.id, exp }, process.env.SECRET);
    res.cookie("Authorization", token, { httpOnly: true, secure: true });
    res.status(201).json({ message: "User created successfully!" });
} catch (err) {
    res.status(500).json({ message: "Internal server error!" });
    return;
}

}


export const login  = async (req: Request, res: Response) => {
    const {
        email, 
        password
    } = req.body;
    

    const user = await prisma.user.findFirst({
        // @ts-ignore
        where: {
            email: email
        }
    });

    if (!user) {
        res.status(401).json({ message: "Invalid email or password!" });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid email or password!" });
        return;
    }

    if (process.env.SECRET === undefined) {
        res.status(500).json({ message: "Internal server error!" });
        return;
    }

    const exp = Date.now() + 1000 * 60 * 5;
    const token = jwt.sign({ sub: user.id, exp }, process.env.SECRET);
    res.cookie("Authorization", token, { httpOnly: true, secure: true });
    res.status(200).json({ message: "Login successfully!" });
}

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("Authorization");
    res.status(200).json({ message: "Logout successfully!" });
}

export const getUser = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    res.status(200).json({ user });
}