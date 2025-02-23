import React from "react";
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: `/api/orders`,
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => Router.push(`/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>
      {errors}
      <button onClick={() => doRequest({})} className="btn btn-primary my-2">
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;

  let data;
  try {
    const response = await client.get(`/api/tickets/${ticketId}`);
    data = response.data;
  } catch (error) {
    data = {};
  }

  return { ticket: data };
};

export default TicketShow;
