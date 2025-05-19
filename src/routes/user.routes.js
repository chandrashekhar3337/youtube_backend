import { Router } from "express";
import { sendOtp,verifyOtp, logoutUser,registerUser,refreshAccessToken,DynamicReal } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/verify.middleware.js";
// import { sendOtp, verifyOtp,  } from "../controllers/user.controllers.js";


const router = Router()

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1  
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

// router.route("/login").post(loginUser)
// router.get("/render-pdf", renderPdf);
router.post("/send-otp",sendOtp)
router.post("/verify-otp",verifyOtp)
router.route("/refresh-token").post(refreshAccessToken)
router.post("/DynamicReal",DynamicReal)
// router.route("/api",exportToPDF)


// secured routing
router.route("/logout").post(verifyJwt,logoutUser)
export default router