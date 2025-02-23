import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);

  let data;
  try {
    const response = await client.get("/api/users/currentuser");
    data = response.data;
  } catch (error) {
    data = {};
  }

  let pageProps;

  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
