const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const SECURITY_SECRET = process.env.SECURITY_SECRET || "security_token_secret_key_987654321_abc";
const ALLOWED_CLIENT_ID = process.env.CLIENT_ID || "login-app";
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 menit

/**
 * Membuat Security Token terenkripsi/tervalidasi HMAC
 */
function generateSecurityToken(clientId = ALLOWED_CLIENT_ID) {
    const payload = {
        client_id: clientId,
        nonce: crypto.randomBytes(16).toString("hex"),
        iat: Date.now(),
        exp: Date.now() + TOKEN_EXPIRY_MS
    };

    const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
        .createHmac("sha256", SECURITY_SECRET)
        .update(payloadEncoded)
        .digest("base64url");

    return `${payloadEncoded}.${signature}`;
}

/**
 * Memvalidasi Security Token
 */
function verifySecurityToken(tokenString, expectedClientId = ALLOWED_CLIENT_ID) {
    if (!tokenString || typeof tokenString !== "string") {
        return { valid: false, reason: "Security token tidak ada atau tidak valid." };
    }

    const parts = tokenString.split(".");
    if (parts.length !== 2) {
        return { valid: false, reason: "Format security token salah." };
    }

    const [payloadEncoded, signature] = parts;

    // Verifikasi tanda tangan HMAC
    const expectedSignature = crypto
        .createHmac("sha256", SECURITY_SECRET)
        .update(payloadEncoded)
        .digest("base64url");

    if (signature !== expectedSignature) {
        return { valid: false, reason: "Tanda tangan security token tidak valid." };
    }

    try {
        const payload = JSON.parse(Buffer.from(payloadEncoded, "base64url").toString("utf-8"));

        // Validasi client_id
        if (payload.client_id !== expectedClientId) {
            return { valid: false, reason: "Client ID pada security token tidak sesuai." };
        }

        // Validasi waktu kedaluwarsa (Anti-Replay)
        if (Date.now() > payload.exp) {
            return { valid: false, reason: "Security token telah kedaluwarsa." };
        }

        return { valid: true, payload };
    } catch (err) {
        return { valid: false, reason: "Gagal mengurai payload security token." };
    }
}

/**
 * Express Middleware untuk validasi X-Security-Token
 */
function _global_security_token(req, res, next) {
    if (req.method === "OPTIONS") {
        return next();
    }

    const token = req.headers["x-security-token"] || req.headers["x-csrf-token"];

    if (!token) {
        return res.status(403).json({
            code: 403,
            error: "Forbidden: Header 'X-Security-Token' wajib disertakan sebagai lapisan keamanan tambahan."
        });
    }

    const result = verifySecurityToken(token);
    if (!result.valid) {
        return res.status(403).json({
            code: 403,
            error: `Forbidden: ${result.reason}`
        });
    }

    req.security = result.payload;
    next();
}

module.exports = {
    generateSecurityToken,
    verifySecurityToken,
    _global_security_token
};

