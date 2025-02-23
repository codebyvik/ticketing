import { Publisher, Subjects, TicketUpdatedEvent } from "@cbvticketss/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
