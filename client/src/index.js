import React from "react";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import registerServiceWorker from "./registerServiceWorker";

import "./index.css";
import App from "./App/App";
import store from "./App/store/store";
import { Provider } from 'react-redux'

render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);
registerServiceWorker();
