// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
dotenv.config({
    path: './env'
})
import connectDB from "./db/db.js";


connectDB()








/* (async() => {
    try{
      await mongoose.connect(`${process.env.MONGODB_URI}/ ${ DB_NAME }`)
      app.on("error" ,(error) => {
        console.log("not able to talkn with express", error)
        throw error
      })

      app.liten(process.env.PORT, () =>{
        console.log(`App is listening PORRT: ${process.env.PORT}`)
      })
    }
    catch (error){
       console.error("Error :", error);
       throw err
    }
})() */

