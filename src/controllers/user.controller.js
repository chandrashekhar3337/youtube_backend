import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apierror.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const generateRefreshAccessToken = async(userId,res) => {
     
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        
        const refreshToken = user.generateRefreshToken()
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        user.refreshToken= refreshToken;
        await user.save({validateBeforeSave:false})

        // return {accessToken,refreshToken}

        const option = {
            httpOnly:true,
            secure:true
        }
        return res.status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken", refreshToken,option)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser, accessToken, refreshToken
                }
                ,
                "user logged in successfully"
            )
        )
    } catch (error) {
        console.error("Token Generation Error:", error); // ✅ Log real error
        throw new ApiError(500, error.message || "Something wrong while generating access token");
    }
}


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
   await user.save(); 

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"error on the server side")
   }

   return res.status(201).json(
      new  ApiResponse(200,"djfnufc")
   )
})

   const loginUser = asyncHandler(async(req,res) => {
       // req.body = data
       //username or mail
       //find the user
       // password check
       //access and refresh token
       //send cookie
       const {email, username, password} =req.body
       console.log(email,password)

       if(!(username || email)){
        throw new ApiError(400,"username and password is reqired")
       }
       const user = await User.findOne({
         $or: [{username}, {email}]
       })
       if(!user){
         throw new ApiError(404, "user does not exist")
       }
       const isPasswordValue = await user.isPasswordCorrect(password)
       console.log(isPasswordValue)

       if(!isPasswordValue){
         throw new ApiError(401,"Enter the write password")
       }

     return await generateRefreshAccessToken(user._id,res)
    //  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   })
   
   const logoutUser = asyncHandler(async(req,res) =>{
      
     await  User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }     
        },{
            new:true
        }
      )

      const option = {
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out successfully"))
   })


export {registerUser,
    loginUser,
    logoutUser}