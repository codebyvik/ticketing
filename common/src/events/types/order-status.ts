export enum OrderStatus {
  // When the order has ben created , but the
  // Ticket it is trying to order has not been reserved
  Created = "created",
  // The Ticket the order is trying to reserve has already
  // been reserved, or when the user has cancelled the order.
  // The order expires before payment
  Cancelled = "cancelled",
  //   The order has successfully reserved the ticket
  AwaitingPayment = "awaiting:payment",
  //   The order has reserved the ticket and the user has
  // provided payment successfully
  Complete = "complete",
}
