import dotenv from "dotenv";
dotenv.config();

import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./utils/db.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import messageRoute from "./routes/message.route.js"
import { app, server } from "./socket/socket.js";
import path from "path"

const PORT = process.env.PORT || 8000

const __dirname = path.resolve()

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true
}

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({ extended: true }))
app.use(cors(corsOptions))

// api
app.use("/api/v1/user", userRoute)
app.use("/api/v1/post", postRoute)
app.use("/api/v1/message", messageRoute)

app.use(express.static(path.join(__dirname, "/Frontend/dist")))
app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"Frontend","dist","index.html"))
})


server.listen(PORT, () => {
    connectDB()
    console.log(`Server is listening at port : ${PORT}`);
})

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Coming from backend",
        success: true
    })
})