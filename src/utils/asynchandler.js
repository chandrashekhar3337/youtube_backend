// src/utils/asynchandler.js

const asyncHandler = (requestHandler) => (req, res, next) => {
    return Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
  
  export { asyncHandler };
  


/* const asynchandler = (fn)  => async (req,res,next) =>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(error.code || 500).json({
            success:false,
            message:error.message
        })
    }

} */