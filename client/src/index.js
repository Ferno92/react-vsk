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

if(window.location.hostname === 'react-vsk.herokuapp.com'){
  initializeReactGA();
  history.listen(analyticsListener);
  
  function analyticsListener(location){
    var pageName = location.pathname.substring(
      location.pathname.indexOf("/") + 1, 
      location.pathname.lastIndexOf("/")
  );
    ReactGA.pageview(pageName);
  }
}
registerServiceWorker();
