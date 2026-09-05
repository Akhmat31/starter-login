let express      = require("express");
let cors         = require("cors");
let dotenv       = require("dotenv");
dotenv.config();

let base         = require("./src/base");
let middleware   = require("./src/http/middleware/base-middleware-loader");

var app     = express();
var PORT    = process.env.PORT || 5000;

app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-access-token",
        "x-client-origin",
        "x-security-token",
        "x-csrf-token"
    ]
}));

app.use(express.json());
app.use(middleware);
app.use(base);

app.use(function (req, res, next) {
    res.status(404).json({ code: 404, error: "404 - Not Found" });
});

if (require.main === module) {
    app.listen(PORT, "0.0.0.0", function () {
        console.log("Gateway service running on port " + PORT);
    });
}

module.exports = app;