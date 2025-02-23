import express from "express";
import "express-async-errors";

import { NotFountError, currentUser, errorHandler } from "@cbvticketss/common";

import cookieSession from "cookie-session";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes";
import { deleteOrderRouter } from "./routes/delete";

const app = express();
app.set("trust proxy", true);
app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async () => {
  throw new NotFountError();
});

app.use(errorHandler);

export { app };
