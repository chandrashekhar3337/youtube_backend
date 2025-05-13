import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js"; 




export const verifyJwt = asyncHandler(async(req, res, next) =>{
try {
    
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ","")
        console.log("token",token)
    
        if(!token){
            throw new ApiError(401,"unauthorized request")
        }
        
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        console.log("decode Token", decodeToken)
        console.log("ID Type:", typeof decodeToken._id);
     
        const user = await User.findOne({ _id: decodeToken._id }).select("-password -refreshToken");
        console.log(user)
    
        if(!user){
            throw new ApiError(401,"invalid acces token")
        }
        req.user = user;
        next()
} catch (error) {
     throw new ApiError(401,"invalid acces error")
}
   
})