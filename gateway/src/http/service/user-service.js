const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_dan_panjang_kunci_rahasia_anda_123456789";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES || "1h";
const ALLOWED_CLIENT_ID = process.env.CLIENT_ID || "login-app";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:8000";
const GATEWAY_SECRET = process.env.GATEWAY_SECRET || "gateway-super-secret-key";

function UserService() { };

UserService.prototype.validateClient = function (client_id) {
    if (!client_id || client_id !== ALLOWED_CLIENT_ID) {
        return {
            valid: false,
            status: 400,
            error: "Parameter client_id tidak valid atau tidak ditemukan."
        };
    }
    return { valid: true };
}

UserService.prototype.validateCredentials = function (username, password) {
    if (!username || !password) {
        return {
            valid: false,
            status: 400,
            error: "Username dan password wajib diisi."
        };
    }
    return { valid: true };
}

UserService.prototype.verifyCredentials = async function (username, password) {
    try {
        const response = await axios.post(`${SERVER_URL}/api/verify`, {
            username,
            password
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-gateway-secret": GATEWAY_SECRET
            }
        });

        const data = response.data;
        
        if (!data.success) {
            const error = new Error(data.error || "Autentikasi gagal.");
            error.status = 401;
            throw error;
        }

        return data;
    } catch (err) {
        if (err.response) {
            const error = new Error(err.response.data?.error || "Autentikasi gagal.");
            error.status = err.response.status || 401;
            throw error;
        }
        throw err;
    }
}

UserService.prototype.generateToken = function (client_id, user) {
    const payload = {
        client_id: client_id,
        username: user.username,
        display_name: user.display_name
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

UserService.prototype.login = async function (username, password, client_id) {

    const clientValidation = this.validateClient(client_id);

    if (!clientValidation.valid) {
        const error = new Error(clientValidation.error);
        error.status = clientValidation.status;
        throw error;
    }
    const credentialValidation = this.validateCredentials(username, password);

    if (!credentialValidation.valid) {
        const error = new Error(credentialValidation.error);
        error.status = credentialValidation.status;
        throw error;
    }
    const verifyData = await this.verifyCredentials(
        username,
        password
    );
    const token = this.generateToken(client_id, verifyData.user);
    return { token, user: verifyData.user };
}

UserService.prototype.getData = async function () {
    try {
        const response = await axios.get(`${SERVER_URL}/api/data`, {
            headers: {
                "Content-Type": "application/json",
                "x-gateway-secret": GATEWAY_SECRET
            }
        });
        return response.data;
    } catch (err) {
        if (err.response) {
            const error = new Error(err.response.data?.error || "Gagal mengambil data dari server service.");
            error.status = err.response.status;
            throw error;
        }
        throw err;
    }
}
module.exports = new UserService();