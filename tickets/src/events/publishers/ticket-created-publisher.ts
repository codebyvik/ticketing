import { Publisher, Subjects, TicketCreatedEvent } from "@cbvticketss/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
