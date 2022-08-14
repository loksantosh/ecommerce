const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");

// 10. API ==================================== CREATE CART BY USER ID ==========================================================

const createCart = async function (req, res) {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid data" });

    let userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({
          status: false,
          messege: "Please enter userId as a valid ObjectId",
        });
    }

    //authorization
    let validUserId = req.decodedToken.userId;
    if (userId != validUserId) {
      return res
        .status(403)
        .send({ status: false, msg: "User is not authorized" });
    }

    const findUserId = await userModel.findById(userId);
    if (!findUserId)
      return res
        .status(404)
        .send({ status: false, messege: "user doesn't exist" });

    const { productId, cartId } = data;
    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .send({
          status: false,
          messege: "Please enter userId as a valid ObjectId",
        });
    }

    const Product = await productModel.findOne({
      _id: productId.toString(),
      isDeleted: false,
    });
    if (!Product)
      return res
        .status(404)
        .send({ status: false, messege: "Product doesn't exist" });

    const findCart = await cartModel.findOne({ userId: userId });

    if (!findCart || (!findCart && findCart.items.length == 0)) {
      let newCart = {
        userId: userId,
        items: { productId },
        totalPrice: Product.price,
        totalItems: 1,
      };

      const createCart = await (
        await cartModel.create(newCart)
      ).populate("items", { _id: 1, title: 1, price: 1, productImage: 1 });
      return res.status(201).send(createCart);
    } else {
      let itemsPresent = findCart.items;

      for (let i = 0; i < itemsPresent.length; i++) {
        if (itemsPresent[i].productId == productId) {
          itemsPresent[i].quantity++;
          findCart.totalPrice = Product.price + findCart.totalPrice;
          const sameProduct = await findCart.save();
          await sameProduct.populate("items.productId", {
            _id: 1,
            title: 1,
            price: 1,
            productImage: 1,
          });
          return res.send(sameProduct);
        }
      }

      const updateCart = await cartModel.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            totalPrice: Product.price + findCart.totalPrice,
            totalItems: findCart.items.length + 1,
          },
          $push: { items: { productId } },
        },
        { new: true }
      );
      await updateCart.populate("items.productId", {
        _id: 1,
        title: 1,
        price: 1,
        productImage: 1,
      });
      return res.status(201).send(updateCart);
    }
  } catch (error) {
    return res.status(500).send({ status: 500, msg: error.message });
  }
};

// 11. API ==================================== UPDATE CART BY USER ID ==========================================================

const updateCart = async function (req, res) {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid data" });

    let userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, messege: "enter valid objectID" });

    if (!userId)
      return res
        .status(400)
        .send({ status: false, messege: "userId is required" });

    //authorization
    let validUserId = req.decodedToken.userId;
    if (userId != validUserId) {
      return res
        .status(403)
        .send({ status: false, msg: "User is not authorized" });
    }

    const findUserId = await userModel.findById(userId);
    if (!findUserId)
      return res
        .status(404)
        .send({ status: false, messege: "user doesn't exist" });

    const { productId, cartId, removeProduct } = data;
    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .send({
          status: false,
          messege: "Please enter userId as a valid ObjectId",
        });
    }

    const Product = await productModel.findOne({
      _id: productId.toString(),
      isDeleted: false,
    });
    if (!Product)
      return res
        .status(404)
        .send({ status: false, messege: "Product doesn't exist" });

    if (cartId)
      if (!mongoose.isValidObjectId(cartId))
        return res
          .status(400)
          .send({
            status: false,
            messege: "Please enter userId as a valid ObjectId",
          });

    if (!removeProduct && removeProduct !== 0)
      return res
        .status(404)
        .send({ status: false, messege: "removeProduct is required" });

    const findCart = await cartModel.findOne({ _id: cartId });
    if (!findCart)
      return res.status(404).send({ status: false, messege: `No cart found` });

    if (removeProduct == 0) {
      let itemsPresent = findCart.items;

      for (let i = 0; i < itemsPresent.length; i++) {
        if (itemsPresent[i].productId == productId) {
          let a = itemsPresent[i].quantity;
          itemsPresent.splice(i, 1);
          findCart.totalPrice -= Product.price * a;
          findCart.totalItems -= 1;
          const sameProduct = await findCart.save();
          return res.send(sameProduct);
        }
      }
      return res
        .status(404)
        .send({ status: false, msg: "product doesn't exist" });
    }

    if (removeProduct == 1) {
      let itemsPresent = findCart.items;
      console.log(itemsPresent);

      for (let i = 0; i < itemsPresent.length; i++) {
        if (itemsPresent[i].productId == productId) {
          if (itemsPresent[i].quantity > 1) {
            itemsPresent[i].quantity -= 1;
            findCart.totalPrice -= Product.price;
          } else {
            let a = itemsPresent[i].quantity;
            itemsPresent.splice(i, 1);
            findCart.totalPrice -= Product.price * a;
            findCart.totalItems -= 1;
          }
          const sameProduct = await findCart.save();
          return res.send(sameProduct);
        }
      }
      return res
        .status(404)
        .send({ status: false, msg: "product doesn't exist" });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// 12. API ==================================== GET CART BY USER ID ==========================================================

const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        return res
          .status(400)
          .send({
            status: false,
            messege: "Please enter userId as a valid ObjectId",
          });
      }
    }

    //authorization
    let validUserId = req.decodedToken.userId;
    if (userId != validUserId) {
      return res
        .status(403)
        .send({ status: false, msg: "User is not authorized" });
    }
    const findCart = await cartModel.findOne({ userId: userId });
    if (!findCart)
      return res
        .status(404)
        .send({
          status: false,
          messege: `No cart found with this UserId ${userId}`,
        });
    await findCart.populate("items.productId", {
      _id: 1,
      title: 1,
      price: 1,
      productImage: 1,
    });
    return res
      .status(200)
      .send({ status: true, message: "cart details", data: findCart });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// 13. API ==================================== DELETE CART BY USER ID ==========================================================

const deleteCart = async function (req, res) {
  try {
    const userId = req.params.userId;

    const isValid = mongoose.Types.ObjectId.isValid(userId);
    if (!isValid)
      return res
        .status(400)
        .send({ status: false, messege: "enter valid objectID" });

    if (!userId)
      return res
        .status(400)
        .send({ status: false, messege: "userId is required" });

    //authorization
    let validUserId = req.decodedToken.userId;
    if (userId != validUserId) {
      return res
        .status(403)
        .send({ status: false, msg: "User is not authorized" });
    }

    const findCart = await cartModel.findOne({ userId: userId });
    if (!findCart)
      return res
        .status(404)
        .send({
          status: false,
          messege: `no Cart found with this userId ${userId}`,
        });

    if (findCart.items.length == 0)
      return res
        .status(409)
        .send({ status: false, messege: "cart already deleted" });

    findCart.items = [];
    findCart.totalPrice = 0;
    findCart.totalItems = 0;

    const deleteCart = await findCart.save();

    return res.status(204).send();
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, getCart, deleteCart, updateCart };
