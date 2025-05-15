const express = require("express");
const app = express();

// Helpers
const { OK, NOT_FOUND } = require("./helpers/statusCodes");

// Cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,PATCH,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// App configs
app.use(express.urlencoded( { extended: true} ));
app.use(express.json());

// Routes
const userRoutes = require("./routes/userRoutes");

app.get("/", (req, res) => res.status(OK).json({message: "AQUABALLANCE ADMIN API"}));

app.use("/api/users", userRoutes);

app.use((req, res, next) => res.status(NOT_FOUND).json({message: "This Route Doesn't Exist"}));

// Server Start
const port = 3000;
app.listen(port, () => console.log(`Success!, app runing in: http://localhost:${port}`))