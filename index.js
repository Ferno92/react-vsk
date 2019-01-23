const express = require('express');
const path = require('path');
const secure = require('ssl-express-www');

const app = express();
app.use(secure);

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// An api endpoint that returns a short list of items
app.get('/api/getList', (req,res) => {
    var list = ["item1", "item2", "item3"];
    res.json(list);
    console.log('Sent list of items');
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.get('/client/src/service-worker.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'service-worker.js'));
});

const port = process.env.PORT || 5000;
process.env.REACT_APP_GOOGLE_CLIENT_ID="343378147790-1kena3ipfeao0cletlripd7vbae975dl.apps.googleusercontent.com";
process.env.REACT_APP_FIREBASE_API_KEY="AIzaSyDO4KLmlNjHJ88eV6bOpH2hHptrBkcD1ko";
console.log('process ' + process.env.REACT_APP_GOOGLE_CLIENT_ID);

app.listen(port);
console.log('App is listening on port ' + port);