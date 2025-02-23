import { OrderCreatedEvent, Publisher, Subjects } from "@cbvticketss/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
