import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // We must be in server
    return axios.create({
      baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // We must be in browser
    return axios.create({
      baseURL: "",
    });
  }
};
