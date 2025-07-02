
//NPM
import path from "path";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createRequire } from "module";
import swaggerUi from "swagger-ui-express";
const require = createRequire(import.meta.url);
const swaggerDoc = require("./swagger.json");
dotenv.config();
//Call function
import logger from "./logger.js";
import database from "./src/helper/config/db.js";
import userRouter from "./src/api/users/index.js";
import employeeRouter from "./src/api/employee/index.js";
import salaryAndPayrollRouter from "./src/api/salary/index.js"

const app = express();
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

//swagger set up
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));


//cors
const corsOption = {
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOption));

//main rout
app.use("/users", userRouter);
app.use("/employee", employeeRouter);
app.use("/salary", salaryAndPayrollRouter);

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    console.log("Hello Neeraj");
    res.send("Hello this is server.")
})
//server connection
const server = http.createServer(app).listen(port, () => {
    console.log(`Server running at : http://localhost:${port}`);
    logger.info("HIIII-------------------")
});
database;
