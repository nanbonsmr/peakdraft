import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const KINDE_CLIENT_ID = import.meta.env.VITE_KINDE_CLIENT_ID;
const KINDE_DOMAIN = import.meta.env.VITE_KINDE_DOMAIN;

if (!KINDE_CLIENT_ID || !KINDE_DOMAIN) {
  throw new Error("Missing Kinde configuration. Please set VITE_KINDE_CLIENT_ID and VITE_KINDE_DOMAIN environment variables.");
}

createRoot(document.getElementById("root")!).render(
  <KindeProvider
    clientId={KINDE_CLIENT_ID}
    domain={KINDE_DOMAIN}
    logoutUri={window.location.origin}
    redirectUri={`${window.location.origin}/app`}
  >
    <App />
  </KindeProvider>
);
