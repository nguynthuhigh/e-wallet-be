const tokenAuth = require('../services/token.services')
const { User } = require('../models/user.model');
const {Partner} = require('../models/partner.model')
const ROLE = require('../utils/role')
exports.verifyRole = (role)=>{
    return async  (req, res, next) => {
        const token = req.headers.authorization?.slice(7);
        if(token){
            try {
                const result = await tokenAuth.verifyToken(token);
                const user = await User.findById(result.id);
                if (user && user.role === role) {
                    req.user = result.id;
                    return next();
                } else {
                    return res.status(400).json({ message: "Không đủ quyền truy cập" });
                }
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        else{
            return res.status(404).json({message:"Page not found"})
        }
    };
}
exports.Authenciation =(role)=>{
    return async (req,res,next)=>{
        try{
              const token = req.headers.authorization?.split(' ')[1];
                if(token){
                    const result = await tokenAuth.verifyToken(token);
                    if(role == ROLE.USER){
                        const user = await User.findById(result.id,'email inactive security_code full_name');
                        if(user){
                            req.user = result.id
                            req.security_code = user.security_code
                            req.user_info = user
                            next()
                        }else{
                            return res.status(401).json({ message: 'Unauthorized' })
                        }
                    }
                    if(role == ROLE.PARTNER){
                        const partner = await Partner.findById(result.id,'image email privateKey description name webhook');
                        if(partner){
                            req.partner = partner
                            next()
                        }else{
                            return res.status(401).json({ message: 'Unauthorized' })
                        }
                    }
                }
                else{
                    return res.status(401).json({ message: 'Unauthorized' })
                }
        }catch(error){
            return res.status(401).json({ message: 'Unauthorized' })
        }
      
    }
}
