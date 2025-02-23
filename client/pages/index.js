import React from "react";
import Link from "next/link";
const LandingPage = ({ tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href={`tickets/${ticket.id}`}>View</Link>
        </td>
      </tr>
    );
  });
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client) => {
  let data;
  try {
    const response = await client.get("/api/tickets");
    data = response.data;
  } catch (error) {
    data = {};
  }

  return { tickets: data };
};

export default LandingPage;
