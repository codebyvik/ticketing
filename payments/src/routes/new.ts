import {
  BadRequestError,
  NotAuthorizedError,
  NotFountError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@cbvticketss/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import { Payment } from "../models/payment";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    console.log({ body: req.body });

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFountError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for an cancelled Order");
    }

    const customer = await stripe.customers.create({
      name: req.currentUser?.email,
      email: req.currentUser?.email,
      address: {
        line1: "123 Street Name",
        city: "Mumbai",
        state: "MH",
        postal_code: "400001",
        country: "IN",
      },
      source: token, // Attach payment method to customer
    });

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      // source: token,
      description: "ticket charges",
      customer: customer.id,
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
