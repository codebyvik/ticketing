import {
  BadRequestError,
  NotAuthorizedError,
  NotFountError,
  requireAuth,
  validateRequest,
} from "@cbvticketss/common";
import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { body } from "express-validator";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFountError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved ticket");
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    const { title, price } = req.body;

    ticket.set({
      title,
      price,
    });

    await ticket.save();
    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      userId: ticket.userId,
      price: ticket.price,
      version: ticket.version,
      orderId: "",
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
