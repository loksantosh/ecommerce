const mongoose = require('mongoose')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')

// 9. API ==================================== CREATE CART ==========================================================

const createCart = async function (req, res) {
    let data = req.body

    if (Object.keys(data).length == 0)
        return res.status(400).send({ status: false, msg: "Please enter valid data", });

    let userId = req.params.userId

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, messege: "Please enter userId as a valid ObjectId", });
    }


    const findUserId = await userModel.findById(userId);
    if (!findUserId)
        return res.status(404).send({ status: false, messege: "user doesn't exist" });

    const { productId, cartId } = data
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).send({ status: false, messege: "Please enter userId as a valid ObjectId", });
    }

    const Product = await productModel.findOne({ _id: productId.toString(), isDeleted: false })
    if (!Product)
        return res.status(404).send({ status: false, messege: "Product doesn't exist" });


    if (cartId) {
        if (!mongoose.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, messege: "Please enter userId as a valid ObjectId", });
        }

        const cart = await cartModel.findById(cartId)
        if (!cart)
            return res.status(404).send({ status: false, messege: "cart doesn't exist" });

    }


    const findCart = await cartModel.findOne({ userId: userId })
    if (!findCart || findCart.items.length==0) {
        let newCart = {
            userId: userId,
            items: { productId },
            totalPrice: Product.price,
            totalItems: 1
        }

        const createCart = await cartModel.create(newCart)
        return res.status(201).send(createCart)

    }

    else {
        // const updateQuantity = await cartModel.findOneAndUpdate({ productId: productId }, { $set: { totalPrice: Product.price + findCart.totalPrice, $inc: { quantity: 1 } } }, { new: true })
        // return res.status(201).send(updateQuantity)

         if (!updateQuantity) {

            const updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { totalPrice: Product.price + findCart.totalPrice, totalItems: findCart.items.length + 1 }, $push: { items: { productId } } }, { new: true })
            return res.status(201).send(updateCart)

         }
    }
}

// 10. API ==================================== UPDATE CART BY USER ID ==========================================================



// 11. API ==================================== GET CART BY USER ID ==========================================================
const getCart = async function (req, res) {
    try {
        let userId = req.params.userId;

        if (userId) {
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).send({ status: false, messege: "Please enter userId as a valid ObjectId" });
            }
        }
        const findCart = await cartModel.findOne({ userId: userId })
        if (!findCart)
            return res.status(404).send({ status: false, messege: `No cart found with this UserId ${userId}` });

        return res.status(200).send({ status: true, message: "cart details", data: findCart });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};


// 12. API ==================================== DELETE CART BY USER ID ==========================================================

const deleteCart = async function (req, res) {

    try {
        const userId = req.params.userId

        const isValid = mongoose.Types.ObjectId.isValid(userId)
        if (!isValid) return res.status(400).send({ status: false, messege: "enter valid objectID" })

        if (!userId) return res.status(400).send({ status: false, messege: "userId is required" })

        const deleteCart = await cartModel.findOneAndUpdate((userId), { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })
        if (!deleteCart) return res.status(404).send({ status: false, messege: `no Cart found with this userId ${userId}` })
        return res.status(200).send({ messege: "cart deleted", data: deleteCart })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}




module.exports = { createCart, getCart, deleteCart }