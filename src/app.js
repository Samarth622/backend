import express from "express";
import { userRouter } from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { productRouter } from "./routes/product.routes.js";

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
    express.json({
        limit: "16kb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "16kb",
    })
);

app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter)

export { app };
