import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Pages from "./features/Pages/Pages";
import { reduxStore } from "./features/Redux/Store";
import VersionCheckerManual from "./features/Common/VersionCheckerManual";

function App() {
  // Disable logs in production
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Keep error and warn for debugging
  }

  return (
    <>
      <Provider store={reduxStore}>
        <BrowserRouter>
          <VersionCheckerManual />
          <Pages />
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
