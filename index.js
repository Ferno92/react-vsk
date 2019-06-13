const admin = require("firebase-admin");
const serviceAccount = require("./adminsdk-key.json");
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://react-pwa-2280e.firebaseio.com"
});
const db = admin.database();
const ref = db.ref("/calendar");
const express = require('express');
const path = require('path');
const secure = require('ssl-express-www');
const webPush = require('web-push');

const app = express();
app.use(secure);

// if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
//   console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY "+
//     "environment variables. You can use the following ones:");
//   console.log(webPush.generateVAPIDKeys());
//   return;
// }
const vapidPublicKey = 'BJQzCYDeFuijftd_AiYfBr8hv6Vr_CG-VcaLnuXdMW-uGW_yH3NEU4d3yAD0KNjCtJ_MtaPk1W0uI8qf_Kz-1OQ';
webPush.setVapidDetails(
  'https://react-vsk.herokuapp.com',
  vapidPublicKey,
  '9BbmqTZ3aR-d3hvtcPeU7BqZyEqoTP95MCjphrTdomI'
);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// An api endpoint that returns a short list of items
app.get('/api/getList', (req,res) => {
    var list = ["item1", "item2", "item3"];
    res.json(list);
    console.log('Sent list of items');
});

//notification region
app.get('/api/vapidPublicKey', (req, res) => {
  res.json(vapidPublicKey);
});

app.post('/api/register', function(req, res) {

  res.sendStatus(201);
});

app.post('/api/sendNotification', function(req, res) {
  console.log('sendNotification', req.body.subscription);
  const subscription = req.body.subscription;
  const payload = req.body.payload;
  const options = {
    TTL: req.body.ttl
  };

  setTimeout(function() {
    payloads[req.body.subscription.endpoint] = payload;
    webPush.sendNotification(subscription, null, options)
    .then(function() {
      res.sendStatus(201);
    })
    .catch(function(error) {
      res.sendStatus(500);
      console.log(error);
    });
  }, req.body.delay * 1000);
});

app.get('/api/getPayload', function(req, res) {
  res.send(payloads[req.query.endpoint]);
});

//end notification region

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.get('/client/src/service-worker.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'service-worker.js'));
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
        // setTimeout(function(){
        //   webPush.sendNotification(
        //     pushSubscription,
        //     'opponents: ' + childSnapshot.val().opponents,
        //     options
        //   );
        // }, ms)
      }
    });
  },
  function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  }
);
console.log('App is listening on port ' + port);