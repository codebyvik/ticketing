import { PaymentCreatedEvent, Publisher, Subjects } from "@cbvticketss/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
