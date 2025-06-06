import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"
// import {renderRoutes }from './routes/render.routes.js';
 const app = express();

 app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET","POST","PUT","DELETE"],
    credential:true
 }))

 app.use(express.json({limit:"16kb"}))
 app.use(express.urlencoded({extended:true, limit:"16kb"}))
 app.use(express.static("public"))

 app.use(cookieParser())


 // routes:import
 import userRouter from './routes/user.routes.js'
 // routed declartion:
app.use("/api/v1/users",userRouter)
// app.use('/api/v1/users', renderRoutes);

 export { app }