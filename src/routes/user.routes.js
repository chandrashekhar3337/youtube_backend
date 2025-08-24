import { Router } from "express";
import { sendOtp,verifyOtp, logoutUser,registerUser,refreshAccessToken,loginUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/verify.middleware.js";
const router = Router()


// router.route("/register").post(upload.fields([
//     {
//         name:"avatar",
//         maxCount:1  
//     },
//     {
//         name:"coverImage",
//         maxCount:1
//     }
// ]),registerUser)

router.post("/register",registerUser)

router.post("/login",loginUser)
router.post("/send-otp",sendOtp)
router.post("/verify-otp",verifyOtp)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/logout").post(verifyJwt,logoutUser)
export default router