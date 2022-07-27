const express = require('express');
const router = express.Router();

const {createUser,loginUser,getUser,updateUser} = require('../controllers/userController');
const{createProduct,getProductbyId,deleteProduct} = require('../controllers/productController')
const{authorization,authentication}= require('../middleware/auth')
const {aws1} = require('../aws/aws')

//================= USER API'S ==================================================

router.post('/register',aws1,createUser)
router.post('/login', loginUser)
router.get('/user/:userId/profile',authentication,getUser)
router.put('/user/:userId/profile', updateUser)

//================= PRODUCT API'S ===================================================
router.post('/products',aws1, createProduct)
 router.get("/products/:productId" , getProductbyId)
 router.delete("/products/:productId" ,deleteProduct )




//================= BAD URL VALIDATION ============================================
router.all("*", (req, res) => {
    res.status(404).send({ msg: "NOT FOUND THIS URL" })
})

module.exports = router