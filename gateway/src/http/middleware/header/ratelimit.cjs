let { rateLimit } = require("express-rate-limit");

var _global_limit_requests = rateLimit({
    windowMs: 5000,
    max: 100,
    message: {
        status: 429,
        error: "Too many requests. Silakan coba lagi nanti."
    },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

module.exports = {_global_limit_requests};