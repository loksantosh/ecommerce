const express = require('express');
const router = express.Router();

const { createUser, loginUser, getUser, updateUser } = require('../controllers/userController');
const { createProduct, getProductbyId, deleteProduct, getProducts } = require('../controllers/productController')
const { authorization, authentication } = require('../middleware/auth')


//==== FEATURE-I ======= USER API'S ========================================================
router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/user/:userId/profile', authentication, getUser)
router.put('/user/:userId/profile', updateUser)     // THIS API ADDRESS NOT UPDATED


//==== FEATURE-II ====== PRODUCT API'S======================================================
router.post('/products', createProduct)
router.get("/products", getProducts)
router.get("/products/:productId", getProductbyId)
router.delete("/products/:productId", deleteProduct)


//==== FEATURE-III ====== CART API'S ========================================================
router.post('/users/:userId/cart')
router.put('/users/:userId/cart')
router.get('/users/:userId/cart')
router.delete('/users/:userId/cart')





//================= BAD URL VALIDATION =====================================================
router.all("*", (req, res) => {
    res.status(404).send({ msg: "NOT FOUND THIS URL" })
})

module.exports = router