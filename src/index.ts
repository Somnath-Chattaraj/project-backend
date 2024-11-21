import express, {Request, Response} from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import "dotenv/config";

const prisma = new PrismaClient();

const PORT = 3000;
const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req: Request, res: Response) => {
    await prisma.user.create({data: {email: req.body.email, password: req.body.password}});
    res.status(201).json({message: "User created successfully!"});
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}...`);
})