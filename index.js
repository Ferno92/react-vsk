const admin = require("firebase-admin");
const serviceAccount = require("./adminsdk-key.json");
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://react-pwa-2280e.firebaseio.com"
});
const db = admin.database();
const ref = db.ref("/calendar");
// https://www.npmjs.com/package/node-schedule
// https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications
// https://blog.sessionstack.com/how-javascript-works-the-mechanics-of-web-push-notifications-290176c5c55d
// https://web-push-book.gauntface.com/demos/notification-examples/
const express = require("express");
const path = require("path");
const secure = require("ssl-express-www");
const messaging = admin.messaging();
let registrationTokens = [];
const topic = 'calendar';


const app = express();

app.use(secure);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// An api endpoint that returns a short list of items
app.get("/api/getList", (req, res) => {
  var list = ["item1", "item2", "item3"];
  res.json(list);
  console.log("Sent list of items");
});

//
app.post("/api/settoken", (req, res) => {
  const value = JSON.stringify(req.query.value);
  res.json('OK');
  if(registrationTokens.indexOf(value) < 0){
    console.log('subscribeToTopic and push value');
    console.log('value1= ', value);
    console.log('value2= ', req.query.value);
    registrationTokens.push(value);
    subscribeToTopic();
  }
});

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.get("/client/src/service-worker.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "service-worker.js"));
});

const port = process.env.PORT || 5000;

app.listen(port);
ref.on(
  "value",
  function(snapshot) {
    var tempCalendar = [];
    snapshot.forEach(childSnapshot => {
      var event = childSnapshot.val();
      event.key = childSnapshot.key;
      console.log("event", event);

      var ms = new Date(event.date).getTime() - new Date();

      if (ms > 0) {
        tempCalendar.push(event);
        var minutes = Math.floor(ms / 60000);
        var seconds = ((ms % 60000) / 1000).toFixed(0);
        console.log(
          "remaining " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds
        );
        setTimeout(function() {
          console.log("send push notification");
          // This registration token comes from the client FCM SDKs.

          var message = {
            data: {
              score: "3 - 1",
              team: "IGNORANTEAM!!"
            },
            topic: topic
          };

          // Send a message to the device corresponding to the provided
          // registration token.
          messaging
            .send(message)
            .then(response => {
              // Response is a message ID string.
              console.log("Successfully sent message:", response);
            })
            .catch(error => {
              console.log("Error sending message:", error);
            });
        }, ms); //MOCK ms
      }
    });
  },
  function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  }
);

//TODO: create ref to add registration tokens on firebase & unsubscribe clients when update token


function subscribeToTopic(){
  for(i = 0; i < registrationTokens.length; i++){
    console.log('token at index ' + i, registrationTokens[i]);
  }
  messaging.subscribeToTopic(registrationTokens, topic)
  .then(function(response) {
    // See the MessagingTopicManagementResponse reference documentation
    // for the contents of response.
    console.log('Successfully subscribed to topic:', response);
    if(response.errors && response.errors.length > 0){
      console.log('errors on response', JSON.stringify(response.errors[0].error));
    }
  })
  .catch(function(error) {
    console.log('Error subscribing to topic:', error);
  });
}


console.log("App is listening on port " + port);
