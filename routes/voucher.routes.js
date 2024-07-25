const express = require('express')
const router = express.Router()
const roleAuth = require('../middlewares/role.middleware')
const ROLE = require('../utils/role')
const controller = require('../controller/voucher.controller')
const validate = require('../middlewares/validate.middleware')

router.post('/add-voucher',validate.validateAddVoucher,roleAuth.Authenciation(ROLE.PARTNER),controller.addVoucher)
router.post('/delete-voucher',validate.validateAddVoucher,controller.addVoucher)
router.post('/get-vouchers',validate.validateAddVoucher,controller.addVoucher)
router.get('/get-vouchers-partner',controller.getVouchersPartner)





//,roleAuth.Authenciation(ROLE.PARTNER)
module.exports = router