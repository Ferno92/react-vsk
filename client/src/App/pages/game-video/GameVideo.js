import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import TextField from "@material-ui/core/TextField";
import { Button, Card, CardContent, IconButton } from "@material-ui/core";
import store from "../../store/store";
import { showMessageAction } from "../../actions/actions";
import { Close } from "@material-ui/icons";

class GameVideo extends React.Component {
  state = {
    videoUrls: [],
    shareUrl: "",
    isOwnerMe: false,
    title: ""
  };
  videoRef = null;

  componentDidMount() {
    var user = ls.get("user");
    if (
      user !== null &&
      (this.props.owner === undefined || this.props.owner === user.id)
    ) {
      this.setState({ isOwnerMe: true });
    }
  }

  componentWillUnmount() {
    if (this.videoRef !== null) {
      this.videoRef.off("value");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.videoRef === null &&
      nextProps.gameUrl &&
      nextProps.gameUrl !== ""
    ) {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      this.db = firebase.app().database();
      this.videoRef = this.db.ref(nextProps.gameUrl + "/videos");
      var self = this;
      this.videoRef.on("value", function(snapshot) {
        if (snapshot.val()) {
          self.setState({ videoUrls: snapshot.val() });
        }
      });
    }
  }

  handleChangeUrl = event => {
    this.setState({ shareUrl: event.currentTarget.value });
  };

  handleChangeTitle = event => {
    this.setState({ title: event.currentTarget.value });
  };

  startLive = () => {
    //TODO: container overflow
    
    //ex. https://youtu.be/kdy5MdmZ3TU
    const { videoUrls, shareUrl, title } = this.state;
    var youtube = "https://youtu.be/";
    var id =
      shareUrl.indexOf(youtube) >= 0 ? shareUrl.replace(youtube, "") : "";
    if (id !== "") {
      var url = "https://www.youtube.com/embed/" + id;
      var temp = videoUrls.slice();
      temp.push({
        url: url,
        titleVideo: title.trim().length > 0 ? title.trim() : "Nessun titolo"
      });
      this.setState({ videoUrls: temp, shareUrl: "", title: "" });
      this.videoRef.set(temp);
    } else {
      store.dispatch(
        showMessageAction("error", "Formato url video non valido")
      );
    }
  };

  onRemoveVIdeo = url => {
    const { videoUrls } = this.state;
    var temp = videoUrls.slice();
    var filtered = temp.filter((item, index) => {
      return item.url === url;
    });
    var i = temp.indexOf(filtered[0]);
    temp.splice(i, 1);
    this.setState({ videoUrls: temp });
    this.videoRef.set(temp);
  };

  render() {
    const { videoUrls, shareUrl, isOwnerMe, title } = this.state;
    return (
      <div>
        {isOwnerMe && (
          <div>
            <div style={{ marginBottom: 20 }}>
              Se stai facendo una live youtube di questa partita oppure hai
              filmato dei momenti della partita, inserisci qui l'url del video
              (esempio. https://youtu.be/kdy5MdmZ3TU):
            </div>

            <TextField
              variant="outlined"
              fullWidth
              value={title}
              onChange={this.handleChangeTitle.bind(this)}
              label="Titolo/descrizione video"
            />
            <TextField
              variant="outlined"
              fullWidth
              value={shareUrl}
              onChange={this.handleChangeUrl.bind(this)}
              label="URL video"
              style={{ marginTop: 15 }}
            />
            <Button
              variant="contained"
              style={{ margin: "10px auto", display: "block", padding: 15 }}
              color="primary"
              onClick={this.startLive.bind(this)}
            >
              Aggiungi
            </Button>
          </div>
        )}
        {!isOwnerMe && videoUrls.length === 0 && (
          <div>Il proprietario non sta facendo lo streaming della partita</div>
        )}
        {videoUrls.length > 0 &&
          videoUrls.map((item, index) => {
            const { url, titleVideo } = item;
            return (
              <Card key={index}>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>{titleVideo}</div>
                    <IconButton onClick={this.onRemoveVIdeo.bind(this, url)}>
                      <Close />
                    </IconButton>
                  </div>
                  <iframe
                    style={{ height: "60vw", width: "100%" }}
                    src={url}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="video"
                  />
                </CardContent>
              </Card>
            );
          })}
      </div>
    );
  }
}

export default GameVideo;
