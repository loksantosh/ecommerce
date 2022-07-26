const userModel = require("../models/userModel");
const validator = require("email-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const createUser = async function (req, res) {
  try {
    //let data=req.body
    const { fname, lname, email, phone, password } = req.body;
     
    if (Object.keys(req.body).length == 0) {
      return res.status(400).send({
        status: false,
        msg: "Please enter request data to be created",
      });
    }
    
    //fname
    if (!fname) {
      return res.status(400).send({ status: false, msg: "Please enter fname" });
    }

    //if (typeof fname != "string" || fname.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter  fname as a String" });

    if (!/^\w[a-zA-Z.\s_]*$/.test(fname))
      return res
        .status(400)
        .send({ status: false, msg: "The  fname may contain only letters" });

    //lname
    if (!lname) {
      return res.status(400).send({ status: false, msg: "Please enter lname" });
    }
    //if (typeof name != "string" || name.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter  lname as a String" });

    if (!/^\w[a-zA-Z.\s_]*$/.test(lname))
      return res
        .status(400)
        .send({ status: false, msg: "The  lname may contain only letters" });

    //email
    if (!email) {
      return res.status(400).send({ status: false, msg: "email is missing" });
    }

    let checkEmail = validator.validate(email);
    if (!checkEmail) {
      return res
        .status(400)
        .send({ status: false, msg: "please enter email in valid format " });
    }

    let uniqueEmail = await userModel.findOne({ email });
    if (uniqueEmail) {
      return res
        .status(400)
        .send({ status: false, msg: "This email already exists" });
    }
    //profileimage
    let files = req.files;

    if (!files) {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter  profileImage" });
    }

    //if (typeof files != "string" || files.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter   profileImage as a String" });

    //aws
    req.body.profileImage = req.profileImage;

    //phone
    if (!phone) {
      return res.status(400).send({ status: false, msg: "phone is missing" });
    }

    if (typeof phone !== "string")
      return res
        .status(400)
        .send({ status: false, msg: " Please enter  phone as a String" });

    if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone))
      return res.status(400).send({
        status: false,
        msg: "Please enter a valid Indian phone number",
      });

    let uniquephone = await userModel.findOne({ phone: phone });
    if (uniquephone) {
      return res
        .status(400)
        .send({ status: false, msg: "This phone number already exists" });
    }

    //password
    if (!password) {
      return res
        .status(400)
        .send({ status: false, msg: "password is missing" });
    }

    if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(
        password
      )
    )
      return res.status(400).send({
        status: false,
        msg: "password must be 8-15 charecter long with a number special charecter and should have both upper and lowercase alphabet",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    req.body.password = hashedPass;

    //shipping===================================================================================================================
    const address = JSON.parse(req.body.address);
    //street
    const shipping = address.shipping;
    if (!shipping.street) {
      return res.status(400).send({ status: false, msg: "street is missing" });
    }
    if (
      typeof shipping.street != "string" ||
      shipping.street.trim().length == 0
    )
      return res
        .status(400)
        .send({ status: false, msg: " Please enter  street as a String" });

    //city
    if (!shipping.city) {
      return res.status(400).send({ status: false, msg: "city is missing" });
    }
    if (typeof shipping.city != "string" || shipping.city.trim().length == 0)
      return res
        .status(400)
        .send({ status: false, msg: " Please enter city as a String" });

    if (!/^\w[a-zA-Z.\s_]*$/.test(shipping.city))
      return res
        .status(400)
        .send({ status: false, msg: "The city may contain only letters" });

    //pincode
    if (!shipping.pincode) {
      return res.status(400).send({ status: false, msg: "pincode is missing" });
    }
    if (typeof shipping.pincode != "number")
      return res
        .status(400)
        .send({ status: false, msg: " Please enter pincode as a number" });
    if (!/^\d{6}$/.test(shipping.pincode))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid Pincode" });

    //===========billingAddress===============================================================================================================================
    //street
    const billing = address.billing;
    if (!billing.street) {
      return res.status(400).send({ status: false, msg: "street is missing" });
    }
    if (typeof billing.street != "string" || billing.street.trim().length == 0)
      return res
        .status(400)
        .send({ status: false, msg: " Please enter  street as a String" });

    //city
    if (!billing.city) {
      return res.status(400).send({ status: false, msg: "city is missing" });
    }
    if (typeof billing.city != "string" || billing.city.trim().length == 0)
      return res
        .status(400)
        .send({ status: false, msg: " Please enter city as a String" });

    if (!/^\w[a-zA-Z.\s_]*$/.test(billing.city))
      return res
        .status(400)
        .send({ status: false, msg: "The city may contain only letters" });

    //pincode
    if (!billing.pincode) {
      return res.status(400).send({ status: false, msg: "pincode is missing" });
    }
    if (typeof billing.pincode != "number")
      return res
        .status(400)
        .send({ status: false, msg: " Please enter pincode as a number" });
    if (!/^\d{6}$/.test(address.billing.pincode))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid Pincode" });

    req.body.address = address;

    let saveData = await userModel.create(req.body);
    return res.status(201).send({
      status: true,
      message: "User created successfully",
      data: saveData,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//=====================================================================================================================================

const loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;

    if (Object.keys(req.body).length == 0) {
      return res
        .status(400)
        .send({ status: false, messege: "please enter data in request body" });
    }

    if (!email) {
      return res
        .status(400)
        .send({ status: false, messege: "please enter email" });
    }

    if (!password) {
      return res
        .status(400)
        .send({ status: false, messege: "please enter password " });
    }

    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ status: false, messege: "no data found " });
    }

    let validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
      return res.status(400).send({ status: false, messege: "wrong password" });

    let token = jwt.sign(
      {
        userId: user._id.toString(),
        batch: "radon",
        organisation: "functionUp",
      },
      "Group66",
      { expiresIn: "3600s" }
    );

    let id = user._id;
    return res.status(200).send({
      status: true,
      messege: "User login successfull",
      data: { id, token },
    });
  } catch (err) {
    return res.status(500).send({ status: false, messege: err.message });
  }
};

//====================================================== GET USER BY ID======================================================================

const getUser = async function (req, res) {
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

    let userDetail = await userModel.findById(userId);

    if (!userDetail)
      return res
        .status(404)
        .send({ status: false, messege: "User not found!" });

    return res
      .status(200)
      .send({
        status: true,
        message: "User profile details",
        data: userDetail,
      });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

//============================================================================================================================

const updateUser = async (req, res) => {
//   try {
    let userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, messege: "enter valid objectID" });

    if (!userId)
      return res
        .status(400)
        .send({ status: false, messege: "userId is required" });

    const user = await userModel.findById(userId);
    if (!user)
      return res.status(404).send({ status: false, messege: "no data found " });

    const data = req.body;

    let { fname, lname, email, phone, password, profileImage ,address } = data;
    // if(data){
    // if (Object.keys(data).length == 0  ) {
    //   return res.status(400).send({
    //     status: false,
    //     msg: "Please enter request data to be created",
    //   });
    // }
    // }

    if (fname) {
      if (!/^\w[a-zA-Z.\s_]*$/.test(fname))
        return res
          .status(400)
          .send({ status: false, msg: "The  fname may contain only letters" });
    }
    if (lname) {
      if (!/^\w[a-zA-Z.\s_]*$/.test(lname))
        return res
          .status(400)
          .send({ status: false, msg: "The  fname may contain only letters" });
    }
    if (email) {
      let checkEmail = validator.validate(email);
      if (!checkEmail) {
        return res
          .status(400)
          .send({ status: false, msg: "please enter email in valid format " });
      }
      let uniqueEmail = await userModel.findOne({ email });
      if (uniqueEmail) {
        return res
          .status(400)
          .send({ status: false, msg: "This email already exists" });
      }
    }

    if (phone) {
      if (typeof phone !== "string")
        return res
          .status(400)
          .send({ status: false, msg: " Please enter  phone as a String" });

      if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone))
        return res.status(400).send({
          status: false,
          msg: "Please enter a valid Indian phone number",
        });

      let uniquephone = await userModel.findOne({ phone: phone });
      if (uniquephone) {
        return res
          .status(400)
          .send({ status: false, msg: "This phone number already exists" });
      }
    }
    if (password) {
      if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(
          password
        )
      )
        return res.status(400).send({
          status: false,
          msg: "password must be 8-15 charecter long with a number special charecter and should have both upper and lowercase alphabet",
        });

      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);
      req.body.password = hashedPass;
    }

   
      profileImage = req.profileImage;
    

     

    if (address) {
        address = JSON.parse(req.body.address);
        if(address.shipping){

      const shipping = address.shipping;
      if (!shipping.street) {
        return res
          .status(400)
          .send({ status: false, msg: "street is missing" });
      }
      if (
        typeof shipping.street != "string" ||
        shipping.street.trim().length == 0
      )
        return res
          .status(400)
          .send({ status: false, msg: " Please enter  street as a String" });

      //city
      if (!shipping.city) {
        return res.status(400).send({ status: false, msg: "city is missing" });
      }
      if (typeof shipping.city != "string" || shipping.city.trim().length == 0)
        return res
          .status(400)
          .send({ status: false, msg: " Please enter city as a String" });

      if (!/^\w[a-zA-Z.\s_]*$/.test(shipping.city))
        return res
          .status(400)
          .send({ status: false, msg: "The city may contain only letters" });

      //pincode
      if (!shipping.pincode) {
        return res
          .status(400)
          .send({ status: false, msg: "pincode is missing" });
      }
      if (typeof shipping.pincode != "number")
        return res
          .status(400)
          .send({ status: false, msg: " Please enter pincode as a number" });
      if (!/^\d{6}$/.test(shipping.pincode))
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid Pincode" });

    }

      //===========billingAddress===============================================================================================================================
      //street
      if(address.billing){
      const billing = address.billing;
      if (!billing.street) {
        return res
          .status(400)
          .send({ status: false, msg: "street is missing" });
      }
      if (
        typeof billing.street != "string" ||
        billing.street.trim().length == 0
      )
        return res
          .status(400)
          .send({ status: false, msg: " Please enter  street as a String" });

      //city
      if (!billing.city) {
        return res.status(400).send({ status: false, msg: "city is missing" });
      }
      if (typeof billing.city != "string" || billing.city.trim().length == 0)
        return res
          .status(400)
          .send({ status: false, msg: " Please enter city as a String" });

      if (!/^\w[a-zA-Z.\s_]*$/.test(billing.city))
        return res
          .status(400)
          .send({ status: false, msg: "The city may contain only letters" });

      //pincode
      if (!billing.pincode) {
        return res
          .status(400)
          .send({ status: false, msg: "pincode is missing" });
      }
      if (typeof billing.pincode != "number")
        return res
          .status(400)
          .send({ status: false, msg: " Please enter pincode as a number" });
      if (!/^\d{6}$/.test(address.billing.pincode))
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid Pincode" });
    }

      req.body.address = address;
    }

 const updateUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          fname: fname,
          lname: lname,
          email: email,
          profileImage: profileImage,
          phone: phone,
          password: password,
          address:address
         
        },
      },
      { new: true }
    );

    res
      .status(200)
      .send({ status: true, messege: "User profile updated", data: updateUser });
//   } catch (err) {
//     res.status(500).send({ status: false, message: err.message });
//   }
};

module.exports = { createUser, loginUser, getUser,updateUser };
