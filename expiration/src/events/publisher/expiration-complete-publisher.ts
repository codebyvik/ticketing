import { Publisher, ExpirationCompleteEvent, Subjects } from "@cbvticketss/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
