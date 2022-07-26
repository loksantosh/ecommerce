const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const aws = require('../aws/aws');

//================= USER API'S ===================================================

router.post('/register',aws.aws1, userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile', userController.getUser)
router.put('/user/:userId/profile',aws.aws1, userController.updateUser)


//================= BAD URL VALIDATION ============================================
router.all("*", (req, res) => {
    res.status(404).send({ msg: "NOT FOUND THIS URL" })
})

module.exports = router