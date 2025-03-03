import React, { useEffect, useState } from "react";
import useRequest from "../../hooks/useRequest";
import StripeCheckout from "react-stripe-checkout";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
      token: "tok_c",
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order expired</div>;
  }

  return (
    <div>
      Time left to pay :{timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51IlbAnSCZcZQMjATZ0w6wEE08WCkiLkcHRhqXRvIMrzIrPZzKEsxEy1Kw0rava2OakqPWmI0v959aCD5nwnuDasu00hmYAkSpO"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query;

  let data;
  try {
    const response = await client.get(`/api/orders/${orderId}`);
    data = response.data;
  } catch (error) {
    data = {};
  }

  return { order: data, currentUser };
};
export default OrderShow;
