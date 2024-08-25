const AppError = require("../helpers/handleError");
const token = require('../utils/token')
const userServices = require('../services/user.services');
const catchError = require("./catchError.middleware");
const AdminServices = require('../services/admin/admin.services')
module.exports = {
    authenticationUser:catchError(async(req,res,next)=>{
        const accessToken = req.headers.authorization?.split(' ')[1]
        if(!accessToken){
            throw new AppError("Unauthorized",401)
        }
        const payload = token.verifyToken(accessToken)
        const user = await userServices.getUserById(payload.id)
        req.user = user._id
        req.security_code = user.security_code
        req.user_info = user
        next()
    }),
    authenticationAdmin:catchError(async(req,res,next)=>{
        const accessToken = req.cookies.access_token
        if(!accessToken){
            throw new AppError("Unauthorized",401)
        }
        const payload = token.verifyToken(accessToken)
        const admin = await AdminServices.findAdminById(payload.id)
        next()
    })
}