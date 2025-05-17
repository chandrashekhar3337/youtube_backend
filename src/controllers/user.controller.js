import { asyncHandler } from "../utils/asynchandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apierror.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { OTP } from "../models/otp.models.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt  from "jsonwebtoken";



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
//     const avatarPath = req.files?.avatar?.[0]?.path;
//     const coverImagePath = req.files?.coverImage?.[0]?.path;


//     if(!avatarPath){
//         throw new ApiError(404, "avtar required")
//     }
//    const avatar= await uploadOnCloudinary(avatarPath)
//    const coverImage = await uploadOnCloudinary(coverImagePath)
//    if(!avatar){
//     throw new ApiError(404, "avatar required")
//    }

   const user = await User.create({
      fullname,
      email,
    //   avatar:avatar.url,
    //   coverImage:coverImage.url,
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

//    const loginUser = asyncHandler(async(req,res) => {
//        // req.body = data
//        //username or mail
//        //find the user
//        // password check
//        //access and refresh token
//        //send cookie
//        const {email, username, password} =req.body
//        console.log(email,password)

//        if(!(username || email)){
//         throw new ApiError(400,"username and password is reqired")
//        }
//        const user = await User.findOne({
//          $or: [{username}, {email}]
//        })
//        if(!user){
//          throw new ApiError(404, "user does not exist")
//        }
//        const isPasswordValue = await user.isPasswordCorrect(password)
//        console.log(isPasswordValue)

//        if(!isPasswordValue){
//          throw new ApiError(401,"Enter the write password")
//        }

//      return await generateRefreshAccessToken(user._id,res)
//     //  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//    })
// ✅ Send OTP Controller
const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({ email, otp });

    await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

    res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully"));
});

// ✅ Verify OTP Controller
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

    const existingOtp = await OTP.findOne({ email, otp });
    if (!existingOtp) throw new ApiError(400, "Invalid or expired OTP");

    let user = await User.findOne({ email });

    if (!user) {
        // New user bana do agar pehli baar OTP se login kar raha hai
        user = await User.create({
            username: email.split("@")[0] + Math.floor(Math.random() * 1000),
            email,
            fullname: "OTP User",
            avatar: "https://i.ibb.co/default-avatar.png", // default
            password: "OtpLogin@123", // dummy password
        });
    }

    await OTP.deleteMany({ email }); // OTP hatado after use

    return await generateRefreshAccessToken(user._id, res);
});
   
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

   const refreshAccessToken = asyncHandler(async(req,res) =>{
    
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken
    console.log(incomingRefreshToken)
    if(!incomingRefreshToken){
         throw new ApiError(401,"unauthorized request")
     }
     try {
        const decodeToken =jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        console.log(decodeToken)
   
        const user =await User.findById(decodeToken?._id)
        console.log("user",user)
           if(!user){
              throw new ApiError(401, "Refresh token invalid")
          }
   
          if(incomingRefreshToken !== user?.refreshToken){
               throw new ApiError(401, "Refresh token is expired used")
          }
         const option = {
               httpOnly:true,
               secure:true
           }
          return generateRefreshAccessToken(user._id, res)
        //    const {accessToken,newrefreshToken} = await generateRefreshAccessToken(user._id, res);
        //    return res
        //    .status(200)
        //    .cookie("accessToken",accessToken,option)
        //    .cookie("refreshToken",newrefreshToken,option)
        //    .json(
        //        new ApiResponse(
        //            200,
        //            {
        //               accessToken,refreshToken:newrefreshToken
        //            },
        //            "Access Token refresh successfully"
        //        )
        //    )
     } catch (error) {
        throw new ApiError(401,error?.message ||" Invalid refreshToken")
     }

     }

 ) 

export {registerUser,
    refreshAccessToken,
    sendOtp,
    verifyOtp,
    logoutUser}