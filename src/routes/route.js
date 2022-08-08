const express = require('express');
const router = express.Router();

const { createUser, loginUser, getUser, updateUser } = require('../controllers/userController');
const { createProduct, getProductbyId, updateProduct, deleteProduct, getProducts } = require('../controllers/productController')
const { authentication } = require('../middleware/auth')
const { createCart, updateCart, getCart, deleteCart } = require('../controllers/cartControllers')
const { createOrder, updateOrder } = require('../controllers/orderController')


//==== FEATURE-I ======= USER API'S ========================================================
router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/user/:userId/profile', authentication, getUser)
router.put('/user/:userId/profile', authentication, updateUser)


//==== FEATURE-II ====== PRODUCT API'S======================================================
router.post('/products', createProduct)
router.get("/products", getProducts)
router.get("/products/:productId", getProductbyId)
router.put("/products/:productId", updateProduct)
router.delete("/products/:productId", deleteProduct)


//==== FEATURE-III ====== CART API'S =========================================================
router.post('/users/:userId/cart', authentication, createCart)
router.put('/users/:userId/cart', authentication, updateCart)
router.get('/users/:userId/cart', authentication, getCart)
router.delete('/users/:userId/cart', authentication, deleteCart)


//==== FEATURE-IV ====== ORDER API'S ========================================================
router.post('/users/:userId/orders', authentication, createOrder)
router.put('/users/:userId/orders', authentication, updateOrder)



//================= BAD URL VALIDATION =====================================================
router.all("*", (req, res) => {
    res.status(404).send({ msg: "NOT FOUND THIS URL" })
})

module.exports = router