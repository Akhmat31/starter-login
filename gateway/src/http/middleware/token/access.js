let jwt = require("jsonwebtoken");
let dotenv = require("dotenv");
dotenv.config();

let JWT_SECRET = process.env.JWT_SECRET || "super_secret_dan_panjang_kunci_rahasia_anda_123456789";
let ALLOWED_CLIENT_ID = process.env.CLIENT_ID || "login-app";

let _global_token = function (req, res, next) {
    let authHeader = req.headers["authorization"] || req.headers["x-access-token"];
    let token = null;

    if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            token = authHeader;
        }
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({
            code: 401,
            error: "Unauthorized: Token otentikasi tidak ditemukan."
        });
    }

    try {
        let decoded = jwt.verify(token, JWT_SECRET);

        // Validate client_id, audience and issuer
        if (!decoded.client_id || (ALLOWED_CLIENT_ID && decoded.client_id !== ALLOWED_CLIENT_ID)) {
            return res.status(403).json({
                code: 403,
                error: "Forbidden: Parameter client_id pada token tidak valid atau tidak diizinkan."
            });
        }
        const expectedAud = process.env.JWT_AUDIENCE || "login-app";
        const expectedIss = process.env.JWT_ISSUER || "gateway";
        if (decoded.aud && decoded.aud !== expectedAud) {
            return res.status(403).json({
                code: 403,
                error: "Forbidden: Audience claim tidak sesuai."
            });
        }
        if (decoded.iss && decoded.iss !== expectedIss) {
            return res.status(403).json({
                code: 403,
                error: "Forbidden: Issuer claim tidak sesuai."
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                code: 401,
                error: "Unauthorized: Token telah kadaluarsa."
            });
        }
        return res.status(401).json({
            code: 401,
            error: "Unauthorized: Token tidak valid."
        });
    }
};

module.exports = { _global_token };