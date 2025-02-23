import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "123",
  });

  // save the ticket to the db
  await ticket.save();
  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  // make two separate changes to the tickets
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });
  // save the first fetch ticket
  await firstInstance!.save();
  // save the second fetched ticket and expect an error
  await expect(secondInstance!.save()).rejects.toThrow();
  //   try {
  //     await secondInstance!.save();
  //   } catch (error) {
  //     return done;
  //   }

  //   throw new Error("Should not react this point");
});

it("increaments th version number on multiple saves", async () => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
