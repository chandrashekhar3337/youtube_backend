import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apierror.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async(req,res) =>{
    // Get user details from the fronnt end:
    // validation - non empty
    // check if user already exist - usetrname : mail
    //check fro images and check for avtar
    // upload them to cloudinary : avtar
    // create user object - to enter into db
    // remove password and refresh token from the response
    // check for user creatio
    //return response:
    
    const {username,fullname,password, email} = req.body
    console.log(username);
    console.log(fullname);
    console.log(email);
    console.log(password);

    // if(fullname = ""){
    //    throw new ApiError(404,"full name is required")
    // }
    // Checking the validation of all the field:
    if([username, fullname, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(404,"this field need to correction")
    }
    const exitedUser =await User.findOne({
        $or:[{username},{email}]
    })
    if(exitedUser){
        throw new ApiError(409,"user already exist");
    }
    const avatarPath = req.files?.avatar?.[0]?.path;
    const coverImagePath = req.files?.coverImage?.[0]?.path;


    if(!avatarPath){
        throw new ApiError(404, "avtar required")
    }
   const avatar= await uploadOnCloudinary(avatarPath)
   const coverImage = await uploadOnCloudinary(coverImagePath)
   if(!avatar){
    throw new ApiError(404, "avatar required")
   }

   const user = await User.create({
      fullname,
      email,
      avatar:avatar.url,
      coverImage:coverImage.url,
      password,
      username:username.toLowerCase()
   })

   const createdUser = User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"error on the server side")
   }

   return res.status(201).json(
      new  ApiResponse(200,"djfnufc")
   )
   
})

export {registerUser}