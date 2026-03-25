import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Pages from "./features/Pages/Pages";
import { reduxStore } from "./features/Redux/Store";

function App() {
  // Disable logs in production
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
  }

  return (
    <>
      <Provider store={reduxStore}>
        <BrowserRouter>
          <Pages />
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
