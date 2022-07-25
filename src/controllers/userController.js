const userModel = require('../models/userModel');
const validator = require('email-validator')
const bcrypt = require('bcrypt');


const createUser = async function (req, res) {
   try {
    let data=req.body
        let { fname, lname, email,phone, password,pincode } = req.body
          //req.body.address=JSON.parse(req.body.address)
        

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: "Please enter request data to be created" })
        }
        //fname
        if (!fname) {
            return res.status(400).send({ status: false, msg: "Please enter fname" })
        }

       // if (typeof fname != "string" || fname.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter  fname as a String" });

        if (!(/^\w[a-zA-Z.\s_]*$/.test(fname))) return res.status(400).send({ status: false, msg: "The  fname may contain only letters" });



        //lname
        if (!lname) {
            return res.status(400).send({ status: false, msg: "Please enter lname" })
        }
        // if (typeof name != "string" || name.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter  lname as a String" });

       if (!(/^\w[a-zA-Z.\s_]*$/.test(lname))) return res.status(400).send({ status: false, msg: "The  lname may contain only letters" });

        //email
        if (!email) {
            return res.status(400).send({ status: false, msg: "email is missing" })
        }

        let checkEmail = validator.validate(email)
        if (!checkEmail) {
            return res.status(400).send({ status: false, msg: "please enter email in valid format " })
        }

        let uniqueEmail = await userModel.findOne({ email })
        if (uniqueEmail) {
            return res.status(400).send({ status: false, msg: "This email already exists" })
        }
    //     //profileimage
    //     let files=req.files

    //     if (!files) {
    //         return res.status(400).send({ status: false, msg: "Please enter  profileImage" })
    //     }

    //   //  if (typeof files != "string" || files.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter   profileImage as a String" });

    //    //aws
    //     req.body.profileImage = req.files



        //phone
        if (!phone) {
            return res.status(400).send({ status: false, msg: "phone is missing" })
        }

        // if (typeof phone !== "string") return res.status(400).send({ status: false, msg: " Please enter  phone as a String" });

        if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) return res.status(400).send({ status: false, msg: "Please enter a valid Indian phone number" });

        let uniquephone = await userModel.findOne({ phone: phone })
        if (uniquephone) {
            return res.status(400).send({ status: false, msg: "This phone number already exists" })
        }

        //password
        if (!password) {
            return res.status(400).send({ status: false, msg: "password is missing" })
        }

        // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password))
        //     return res.status(400).send({ status: false, msg: "password must be 8-15 charecter long with a number special charecter and should have both upper and lowercase alphabet" });

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        req.body.password = hashedPass;

     console.log(address)
      //shipping===================================================================================================================
        let address=JSON.parse(data.address)
        //street
        if (!address.shipping.street) {
            return res.status(400).send({ status: false, msg: "street is missing" })
        }
        if (typeof address.shipping.street != "string" || address.shipping.street.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter  street as a String" });

        // //city
        // if (!address.shipping.city) {
        //     return res.status(400).send({ status: false, msg: "city is missing" })
        // }
        // if (typeof address.shipping.city != "string" || address.shipping.city.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter city as a String" });

        // if (!(/^\w[a-zA-Z.\s_]*$/.test(address.shipping.city))) return res.status(400).send({ status: false, msg: "The city may contain only letters" });

        // //pincode
        // if (!address.shipping.pincode) {
        //     return res.status(400).send({ status: false, msg: "pincode is missing" })
        // }
        // if (typeof address.shipping.pincode != "number") return res.status(400).send({ status: false, msg: " Please enter pincode as a number" });
        // if (!/^\d{6}$/.test(address.shipping.pincode)) return res.status(400).send({ status: false, msg: "Please enter valid Pincode" });

        // //===========billingAddress===============================================================================================================================
        // //street
        // if (!address.billing.street) {
        //     return res.status(400).send({ status: false, msg: "street is missing" })
        // }
        // if (typeof address.billing.street != "string" || address.billing.street.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter  street as a String" });

        // //city
        // if (!address.billing.city) {
        //     return res.status(400).send({ status: false, msg: "city is missing" })
        // }
        // if (typeof address.billing.city != "string" || address.billing.city.trim().length == 0) return res.status(400).send({ status: false, msg: " Please enter city as a String" });

        // if (!(/^\w[a-zA-Z.\s_]*$/.test(address.billing.city))) return res.status(400).send({ status: false, msg: "The city may contain only letters" });

        // //pincode
        // if (!address.billing.pincode) {
        //     return res.status(400).send({ status: false, msg: "pincode is missing" })
        // }
        // if (typeof address.billing.pincode != "number") return res.status(400).send({ status: false, msg: " Please enter pincode as a number" });
        // if (!/^\d{6}$/.test(address.billing.pincode)) return res.status(400).send({ status: false, msg: "Please enter valid Pincode" });

        

        let saveData = await userModel.create(req.body)
        return res.status(201).send({ status: true, message: "User created successfully", data: saveData })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}




// const createUser=async(req,res)=>{

//     const {fname,lname,email,phone,password,address}=req.body
//     req.body.address=JSON.parse(req.body.address)
//     let files=req.files
//    // req.body.profileImage = req.files
//     let saveData = await userModel.create(req.body)
//     return res.status(201).send({ status: true, message: "User created successfully", data: saveData })
   
// }


module.exports = { createUser }