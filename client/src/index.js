import React from "react";
import { render } from "react-dom";
import { Router } from "react-router";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";
import App from "./App/App";
import store from "./App/store/store";
import { Provider } from 'react-redux';
import ReactGA from 'react-ga';
import {createBrowserHistory} from 'history';

function initializeReactGA() {
  ReactGA.initialize('UA-136203956-1');
}
var history = createBrowserHistory();
render(
  <Router history={history}>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>,
  document.getElementById("root")
);

initializeReactGA();
history.listen(analyticsListener);

function analyticsListener(location){
  console.log("analyticsListener", location);
  ReactGA.pageview(location.pathname + location.search);
}
registerServiceWorker();
