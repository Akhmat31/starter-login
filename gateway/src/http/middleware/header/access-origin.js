let dotenv = require("dotenv");
dotenv.config();

var _global_headers = _global_headers || {};

_global_headers.allowed_origin = (req, res, next) => {
    // Izinkan preflight request CORS
    if (req.method === "OPTIONS") {
        return next();
    }

    const origin = req.headers.origin || req.headers.referer || req.headers["x-client-origin"];
    
    const allowedOrigins = [
        process.env.ALLOWED_ORIGIN || "http://localhost:3000",
        "http://127.0.0.1:3000"
    ];

    if (!origin) {
        return res.status(403).json({
            code: 403,
            error: "Forbidden: Akses ditolak. Gateway hanya dapat diakses oleh view dari login-app."
        });
    }

    const isAllowed = allowedOrigins.some(allowed => 
        origin === allowed || origin.startsWith(allowed + "/") || origin.startsWith(allowed + "?")
    );

    if (!isAllowed) {
        return res.status(403).json({
            code: 403,
            error: "Forbidden: Akses dari origin tidak diizinkan. Hanya view login-app yang dapat mengakses gateway."
        });
    }

    next();
};

module.exports = { _global_headers };