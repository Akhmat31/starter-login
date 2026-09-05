const userService = require("../service/user-service.cjs");

function USERS() {}

USERS.prototype.index = function (req, res) {
    return res.json({
        status: "ok",
        message: "Gateway Service Active"
    });

};
USERS.prototype.login = async function (req, res) {
    try {
        const {username, password, client_id} = req.body;
        const result = await userService.login(username, password, client_id);

        return res.json({
            success: true,
            message: "Login berhasil.",
            token: result.token,
            user: result.user
        });
    } catch (err) {
        console.error("Login error:", err);
        const status = err.status || 500;
        if (status !== 500) {
            return res.status(status).json({
                code: status,
                error: err.message
            });
        }
        return res.status(500).json({
            code: 500,
            error: "Terjadi kesalahan internal gateway server."
        });
    }
};


/**
 * GET /data
 */
USERS.prototype.getData = async function (req, res) {
    try {
        const data = await userService.getData();

        return res.json({
            success: true,
            user_auth: req.user,
            data: data
        });
    } catch (err) {
        console.error("Get data error:", err);
        const status = err.status || 500;

        return res.status(status).json({
            code: status,
            error: status === 500 ? "Gagal berkomunikasi dengan server service." : err.message
        });
    }
};
module.exports = {USERS};