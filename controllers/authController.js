const {User} = require('../models')
const jwt = require('jsonwebtoken')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.Login = async (req, res) => {
   if(!req.body.email || !req.body.password) {
      return res.status(400).json({
         status: 'Bad Request',
         message: 'Error Validation',
         error: 'Email dan Password harus diisi'
      })
   }

   const userData = await User.findOne({ where: { email: req.body.email } });
   if (
     !userData ||
     !(await userData.CorrectPassword(req.body.password, userData.password))
   ) {
     return res.status(401).json({
       status: "Unauthorized",
       message: "Error Login",
       error: "Email atau Password yang anda masukkan salah",
     });
   }

   const token = signToken(userData.id)
   return res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      token
   })
}


