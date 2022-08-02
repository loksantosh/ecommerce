const mongoose = require('mongoose')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')


const createOrder = async function (req, res) {
    try {


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

        const {cartId}=data

        if (!mongoose.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, messege: "Please enter userId as a valid ObjectId", });
        }
        
        const findCart = await cartModel.findOne({ cartId:cartId }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        if (!cart)
            return res.status(404).send({ status: false, messege: "cart doesn't exist" });
           
            if (findCart.items.length === 0) {
                return res.status(400).send({ status: false, message: "Your cart is empty" })
            }
        


        

        if (!findCart || findCart.items.length == 0) {
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

            let itemsPresent = findCart.items

            for (let i = 0; i < itemsPresent.length; i++) {
                if (itemsPresent[i].productId == productId) {
                    itemsPresent[i].quantity++
                    findCart.totalPrice = Product.price + findCart.totalPrice
                    const sameProduct = await findCart.save()
                    return res.json(sameProduct)
                }
            }

            const updateCart = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { totalPrice: Product.price + findCart.totalPrice, totalItems: findCart.items.length + 1 }, $push: { items: { productId } } }, { new: true })
            return res.status(201).send(updateCart)



        }
    }
    catch (error) {
        return res.status(500).json({ status: 500, msg: error.message })
    }
}
