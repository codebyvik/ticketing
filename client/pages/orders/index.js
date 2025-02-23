const OrderIndex = ({ orders }) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  let data;
  try {
    const response = await client.get(`/api/orders`);
    data = response.data;
  } catch (error) {
    data = [];
  }

  return { orders: data };
};

export default OrderIndex;
