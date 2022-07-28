const mongoose = require('mongoose')
const productModel = require('../models/productModel')
const uploadFile = require('../aws/aws')

// 5. API ====================================================== CREATE PRODUCT ==========================================================

const createProduct = async function (req, res) {

    const { title, description, price, currencyId, currencyFormat, productImage, availableSizes } = req.body

    if (Object.keys(req.body).length == 0) {
        return res.status(400).send({ status: false, msg: "Please enter request data to be created", });
    }

    //title
    if (!title) {
        return res.status(400).send({ status: false, msg: "Please enter title" });
    }

    let uniqueTitle = await productModel.findOne({ title });
    if (uniqueTitle) {
        return res.status(400).send({ status: false, msg: "This title already exists" });
    }


    //description
    if (!description)
        return res.status(400).send({ status: false, msg: "Please enter description" });



    //price
    if (!price)
        return res.status(400).send({ status: false, msg: "price is missing" });


    //currencyId
    if (!currencyId)
        return res.status(400).send({ status: false, msg: "currencyId is missing" });


    //currencyFormat
    if (!currencyFormat) {
        return res.status(400).send({ status: false, msg: "currencyFormat is missing" });
    }
    if (!/^₹$/.test(currencyFormat))
        return res.status(400).send({ status: false, msg: "The  currencyFormat is not valid" });

    //productImage
    let files = req.files;

    if (!files) {
        return res.status(400).send({ status: false, msg: "Please enter productImage" });
    }

    req.body.productImage = await uploadFile.uploadFile(files[0])

    //availableSizes
    if (availableSizes) {
        let s = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        const availSizes = availableSizes.split(',').map(s => s.trim().toUpperCase())

        for (let i = 0; i < availSizes.length; i++) {
            console.log(availSizes[i])
            if (!s.includes(availSizes[i]))
                return (res.status(400).send({ status: false, msg: "provide only S, XS, M, X, L, XXL, XL" }))
        }
        req.body.availableSizes = availSizes
    }


    const createProduct = await productModel.create(req.body)
    res.status(201).send({ status: true, message: " product created successfully", data: createProduct })

}
// 6. API ====================================================== GET PRODUCT =================================================================
const getProducts = async function (req, res) {

    try {

        let data = req.query
        let priceGreaterThan = req.query.priceGreaterThan
        let priceLessThan = req.query.priceLessThan

        if (data) {

            if (priceGreaterThan && priceLessThan) {
                const filter = await productModel.find({ $and: [data, { isDeleted: false }], price: { $gt: priceGreaterThan, $lt: priceLessThan } })
                if (filter.length == 0) return res.status(404).send({ status: false, messege: "no products found" })
                return res.status(200).send({ status: true, messege: 'products list', data: filter })
            }

            if (priceGreaterThan) {
                const filter = await productModel.find({ $and: [data, { isDeleted: false }], price: { $gt: priceGreaterThan } })
                if (filter.length == 0) return res.status(404).send({ status: false, messege: "no products found" })
                return res.status(200).send({ status: true, messege: 'products list', data: filter })
            }

            if (priceLessThan) {
                const filter = await productModel.find({ $and: [data, { isDeleted: false }], price: { $lt: priceLessThan } })
                if (filter.length == 0) return res.status(404).send({ status: false, messege: "no products found" })
                return res.status(200).send({ status: true, messege: 'products list', data: filter })
            }


            if (data.availableSizes)
                data.availableSizes = data.availableSizes.split(',').map(s => s.trim().toUpperCase())

            const productDetails = await productModel.find({ $and: [data, { isDeleted: false }] }).sort({ price: 1 })

            if (productDetails.length == 0) return res.status(404).send({ status: false, messege: "No product found" })

            return res.status(200).send({ status: true, messege: 'Products list', data: productDetails })

        }
        else {
            const productDetails = await productModel.find({ isDeleted: false }).sort({ price: 1 })
            return res.status(200).send({ status: true, messege: 'Products list', data: productDetails })
        }

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}




// 7. API ====================================================== GET PRODUCT BY ID ========================================================
const getProductbyId = async function (req, res) {
    try {
        let productId = req.params.productId;

        if (productId) {
            if (!mongoose.isValidObjectId(productId)) {
                return res.status(400).send({ status: false, messege: "Please enter userId as a valid ObjectId", });
            }
        }

        let productDetail = await productModel.findById(productId);

        if (!productDetail)
            return res.status(404).send({ status: false, messege: "product not found!" });

        return res.status(200).send({ status: true, message: "product details", data: productDetail, });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};

// 8. API ==================================== DELETE PRODUCT BY ID ==========================================================

const deleteProduct = async function (req, res) {

    try {
        let date = Date.now()
        const productId = req.params.productId

        const isValid = mongoose.Types.ObjectId.isValid(productId)
        if (!isValid) return res.status(400).send({ status: false, messege: "enter valid objectID" })

        if (!productId) return res.status(400).send({ status: false, messege: "productId is required" })

        const alert = await productModel.findById(productId)
        if (!alert) return res.status(404).send({ status: false, messege: "no data found" })

        if (alert.isDeleted) return res.status(409).send({ status: false, messege: "this product is already deleted" })

        const deleteProducts = await productModel.findByIdAndUpdate((productId), { $set: { isDeleted: true, deletedAt: date } }, { new: true })
        res.status(200).send({ status: true, messege: "Success", data: deleteProducts })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



module.exports = { createProduct, getProductbyId, deleteProduct, getProducts };
