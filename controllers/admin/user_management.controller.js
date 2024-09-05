const {User} = require('../../models/user.model')
const {Response} = require('../../utils/response')
const userServices = require('../../services/user.services')
const userManagementServices = require('../../services/admin/user_management.services')
const {getRedisClient} = require('../../configs/redis/redis')
const uploadImage = require('../../helpers/upload_cloudinary')
const catchError = require('../../middlewares/catchError.middleware')
module.exports = {
    //admin
    getUsers:catchError(async(req,res)=>{
        const {page,page_limit}= req.query
        const data = await userManagementServices.getUsers(page,page_limit)
        Response(res,"Success",data,200)
    }),
    banUser:async(req,res)=>{
        try {
            const {id} = req.body
            const data = await userManagementServices.banUser(id)
            if(data.modifiedCount === 0){
                return Response(res,"Fail, try again",null,400)
            }
            if(data.active === true){
                return Response(res,"User successfully unbanned",null,200)
            }else{
                return Response(res,"User successfully banned",null,200)
            }
        } catch (error) {
            console.log(error)
            Response(res,"Error System",null,500)
        }
    },
    getTransactionsUser :async(req,res)=>{
        try {
            const {id,page,page_limit} = req.query
            const data = await userManagementServices.getTransactionsUser(id,page,page_limit)
            return Response(res,"Success",data,200)
        } catch (error) {
            console.log(error)
            Response(res,"Error System",null,500)
        }
    },
    //user
    updateProfile:catchError(async(req,res)=>{
        const id = req.user
        const url = null
        if(req.file && req.file.path){
            url = await uploadImage.upload(req.file.path)
        }
        const data={
            full_name:req.body.full_name,
            avatar:url
        }
        await User.updateOne({_id:id},data,{new:true})
        Response(res,"Cập nhật thông tin thành công",null,400)
    }),
    Profile: catchError(async (req,res)=>{
        const redis = getRedisClient();
        const id = req.user
        const user = req.user_info
        const userKey = `user:${id}`
        const userData = await redis.hgetall(userKey)
        if (Object.keys(userData).length === 0) {
            const wallet = await userServices.getProfile(id)
            const data = {
                userData: user,
                walletData:wallet
            }
            await redis.hset(userKey, {
                userData: JSON.stringify(user),
                walletData: JSON.stringify(wallet),
            });
            await redis.expire(userKey, 600);
            return Response(res,"Success",data,200)
        } 
        if (userData) {
            const userInfo = JSON.parse(userData.userData)
            const walletInfo = JSON.parse(userData.walletData)
            const data = { userData: userInfo, walletData: walletInfo }
            return Response(res, 'Success', data, 200)
            }
        return Response(res,"Success",userData,200)
    }),
    // Profile: async (req,res)=>{
    //     try{
    //         const id = req.user
    //         const user = req.user_info
    //         const wallet = await userServices.getProfile(id);
    //         const data = {
    //             userData: user,
    //             walletData:wallet
    //         }
    //         return Response(res,"Success",data,200)
    //     }
    //     catch (error){
    //         console.log(error)
    //         return Response(res,error,'',200)

    //     }
    // },
    getUser: async (req,res)=>{
        try{
            const email = req.query.email
            const data = await userServices.getUserByEmail(email);
            if (!data) {
                return Response(res, "User not found", null, 404);
            }
            return Response(res,"Success",data,200)
        }
        catch (error){
            console.log(error)
            return Response(res,error,'',200)

        }
    }
}