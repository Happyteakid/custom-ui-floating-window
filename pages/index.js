import { useRouter } from "next/router";
import { useEffect } from "react";
import io from "socket.io-client";

import { useAppContext } from "../shared/context";
import logger from "../shared/logger";
import { initalizeSession } from "../shared/oauth";
import { getCustomUISDK } from "../shared/custom_ui_sdk";
import { handleSocketCommunication } from "../shared/socket";

import ContactList from "../components/ContactList";
import DealFields from "../components/DealFields";
import Dialer from "../components/Dialer";
import FollowUp from "../components/FollowUp";
import Login from "../components/Login";

const log = logger("Core ✨");

export const getServerSideProps = async ({ req, res, query }) => {
  log.info("Checking session details based on query parameters");
  log.info("UserID:" + query.userId);
  log.info("Req:" ,req);
  log.info("Res:",res);
  const session = await initalizeSession(req, res, query.userId);
  
  return session.auth
    ? { props: { auth: true, session } }
    : { props: { auth: false } };
};

const Home = ({ auth, session }) => {
  const router = useRouter();
  const context = useAppContext();
  const socket = io();

  useEffect(() => {
    if (auth) {
      // Update the context variables once the session is initialized
      log.info("Setting user ID to ", router.query.userId);
      context.setUser(session);
      // Initialize Custom UI SDK and Socket communications
      (async () => {
        const sdk = await getCustomUISDK();
        await fetch("/api/socket", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        handleSocketCommunication(socket, context, sdk);
      })();
    }
  }, [router]);

  // Not logged-in? Login again
  if (auth === false) {
    return <Login />;
  }

  return <DealFields {...context} className="scrollable-container2" />;

};

export default Home;