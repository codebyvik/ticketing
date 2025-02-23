import { NotAuthorizedError, NotFountError, OrderStatus, requireAuth } from "@cbvticketss/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate("ticket");
  if (!order) {
    throw new NotFountError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;
  await order.save();

  //  publish an event saying this was cancelled
  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
      price: order.ticket.price,
    },
  });

  res.status(204).send({});
});

export { router as deleteOrderRouter };
