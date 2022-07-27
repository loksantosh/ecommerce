const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

//========================================= AUTHENTICATION ==============================================================

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["authorization"]
        if (!token) {
            return res.status(400).send({ status: false, msg: "please send the token" })
        }
        token = token.split(" ")[1]
        let decodedToken = jwt.verify(token, "Group66", function (error, token) {
            if (error) {
                return undefined
            } else {
                if (Date.now() >= token.exp * 1000) return res.status(400).send({ msg: "token expired" })

                return token
            }
        })
        if (decodedToken == undefined) {
            return res.status(401).send({ status: false, msg: "invalid token" })
        }

        req["decodedToken"] = decodedToken
        next()

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

//========================================= AUTHORIZATION ==============================================================


const authorization = async function (req, res, next) {
    try {
        let validUserId = req.decodedToken.userId
        let id = req.params.userId


        if (id.length != 24) {
            return res.status(400).send({ status: false, msg: " Please enter proper length of user Id" })
        }

        let checkUser = await userModel.findById(id)


        if (!checkUser) {
            return res.status(404).send({ status: false, msg: "no such user exists" })
        }

        if (checkUser._id != validUserId) {
            return res.status(403).send({ status: false, msg: "User is not authorized" })
        }

        next()

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}







module.exports = { authentication, authorization }