import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ChatProvider from "./Context/chatProvider";
import {BrowserRouter} from "react-router-dom";
import {Toast} from "./components/Miscellaneous/Toast"

const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <BrowserRouter>
    <ChatProvider>
      <Toast>
      <App />
      </Toast>
    </ChatProvider>
    </BrowserRouter>
  );
}
