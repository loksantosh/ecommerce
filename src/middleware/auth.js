const jwt = require("jsonwebtoken");

//========================================= AUTHENTICATION ==============================================================

const authentication = async function (req, res, next) {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res
        .status(400)
        .send({ status: false, msg: "please send the token" });
    }
    token = token.split(" ")[1];
    let decodedToken = jwt.verify(token, "Group66", function (error, token) {
      if (error) {
        return undefined;
      } else {
        if (Date.now() >= token.exp * 1000)
          return res.status(400).send({ msg: "token expired" });

        return token;
      }
    });
    if (decodedToken == undefined) {
      return res.status(401).send({ status: false, msg: "invalid token" });
    }

    req["decodedToken"] = decodedToken;
    next();
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

module.exports = { authentication };
