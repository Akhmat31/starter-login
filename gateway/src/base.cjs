let express = require("express");
let { USERS } = require("./http/controller/users.cjs");
let { _global_token } = require("./http/middleware/token/access.cjs");
let { generateSecurityToken, _global_security_token } = require("./http/middleware/token/security-token.cjs");

var router = express.Router();
var user = new USERS();

router.get("/", (req, res) => user.index(req, res));

// Endpoint Handshake untuk memperoleh Security Token (Anti-CSRF & Request Integrity)
router.get("/api/security/token", (req, res) => {
    const securityToken = generateSecurityToken();
    res.json({
        success: true,
        security_token: securityToken,
        expires_in: 900 // 15 menit
    });
});

// Endpoint Login terproteksi Security Token
router.post("/api/login", _global_security_token, (req, res) => user.login(req, res));

// Endpoint Data terproteksi Ganda: Security Token + JWT Auth Token
router.get("/api/data", _global_security_token, _global_token, (req, res) => user.getData(req, res));

router.get("/api/verify-token", _global_security_token, _global_token, (req, res) => {
    res.json({
        valid: true,
        user: req.user,
        security: req.security
    });
});

module.exports = router;