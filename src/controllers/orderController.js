const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");

// 14. API ==================================== CREATE ORDER BY USER ID ==========================================================

const createOrder = async function (req, res) {
  try {
    let data = req.body;

    let cancellable = data.cancellable;

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

    const { cartId, status } = data;

    if (!mongoose.isValidObjectId(cartId)) {
      return res
        .status(400)
        .send({
          status: false,
          messege: "Please enter userId as a valid ObjectId",
        });
    }

    const findCart = await cartModel.findOne({ _id: cartId });
    if (!findCart)
      return res
        .status(404)
        .send({ status: false, messege: "cart doesn't exist" });

    if (findCart.items.length === 0) {
      return res
        .status(400)
        .send({ status: false, message: "Your cart is empty" });
    }
    let order = {};

    order.userId = userId;
    order.items = findCart.items;
    order.totalPrice = findCart.totalPrice;
    order.totalItems = findCart.totalItems;
    order.cancellable = data.cancellable;

    let count = 0;
    for (let i = 0; i < findCart.items.length; i++) {
      count = count + findCart.items[i].quantity;
    }

    order.totalQuantity = count;

    if (status) {
      let statusType = ["pending", "completed", "cancelled"];
      if (!statusType.includes(status))
        return res
          .status(400)
          .send({ status: false, msg: `status should be ${statusType}` });

      order.status = status;
    }

    if (cancellable) {
      if (typeof cancellable != Boolean)
        return res
          .status(400)
          .send({ status: false, msg: "cancellable should be Boolean" });
    }
    const createOrder = await orderModel.create(order);
    await createOrder.populate("items.productId", {
      _id: 1,
      title: 1,
      price: 1,
      productImage: 1,
    });

    findCart.items = [];
    findCart.totalPrice = 0;
    findCart.totalItems = 0;

    await findCart.save();

    return res
      .status(201)
      .send({ status: true, message: "Success", data: createOrder });
  } catch (error) {
    return res.status(500).json({ status: 500, msg: error.message });
  }
};

// 15. API ==================================== UPDATE ORDER BY USER ID ==========================================================

const updateOrder = async function (req, res) {
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

  const { orderId, status } = data;

  const findOrder = await orderModel.findById(orderId);
  if (!findOrder)
    return res
      .status(404)
      .send({ status: false, messege: "order doesn't exist" });

  if (findOrder.cancellable === false) {
    return res
      .status(403)
      .send({ status: false, msg: "order status can not be changed" });
  } else {
    let check = ["pending", "cancelled", "completed"];
    if (!check.includes(status))
      return res
        .status(400)
        .send({ status: false, msg: `order status can only be ${check}` });

    findOrder.status = status;

    const updateOrder = await findOrder.save();
    await updateOrder.populate("items.productId", {
      _id: 1,
      title: 1,
      price: 1,
      productImage: 1,
    });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: updateOrder });
  }
};

module.exports = { createOrder, updateOrder };
