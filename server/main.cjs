var expressjs = require("express");
var profile = require("./mock-data.cjs");

var app = expressjs();
var PORT = 8000;
var GATEWAY_SECRET = "gateway-super-secret-key";

app.use(expressjs.json());
 function gatewayOnlyMiddleware(req, res, next) {
    var gatewaySecret = req.headers["x-gateway-secret"];
    if (!gatewaySecret || gatewaySecret !== GATEWAY_SECRET) {
        return res.status(403).json({
            code: 403,
            error: "Forbidden"
        });
    }
    next();
}

app.use(gatewayOnlyMiddleware);

app.post("/api/verify", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            code: 400,
            error: "Username dan password wajib diisi."
        });
    }
    if (username === profile.username && password === profile.password) {
        return res.json({
            success: true,
            user: {
                username: profile.username,
                display_name: profile.display_name
            }
        });
    }

    return res.status(401).json({
        success: false,
        error: "Username atau password salah."
    });
});

app.get("/api/data", function (req, res) {
    res.json({
        display_name: profile.display_name,
        username: profile.username
    });
});

if (require.main === module) {
    app.listen(PORT, "0.0.0.0", function () {
        console.log("Server service running on port " + PORT);
    });
}

module.exports = app;