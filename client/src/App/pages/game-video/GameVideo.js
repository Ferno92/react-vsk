import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";
import store from "../../store/store";
import {
  showMessageAction
} from "../../actions/actions";

class GameVideo extends React.Component {
  state = {
    videoUrl: "",
    shareUrl: "",
    isOwnerMe: false
  };
  videoRef = null;

  componentDidMount(){
    var user = ls.get("user");
    if (
      user !== null &&
      (this.props.owner === undefined || this.props.owner === user.id)
    ) {
      this.setState({isOwnerMe: true});
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
      this.videoRef = this.db.ref(nextProps.gameUrl + "/video");
      var self = this;
      this.videoRef.on("value", function(snapshot) {
        if (snapshot.val()) {
          self.setState({ videoUrl: snapshot.val() });
        }
      });
    }
  }

  handleChange = event => {
    this.setState({ shareUrl: event.currentTarget.value });
  };

  startLive = () => {
    //ex. https://youtu.be/kdy5MdmZ3TU
    var youtube = "https://youtu.be/";
    var id =
      this.state.shareUrl.indexOf(youtube) >= 0
        ? this.state.shareUrl.replace(youtube, "")
        : "";
    if (id !== "") {
      var url = "https://www.youtube.com/embed/" + id;
      this.setState({ videoUrl: url });
      this.videoRef.set(url);
    }else{
        store.dispatch(showMessageAction("error", "Formato url video non valido"));
    }
  };

  render() {
    const { videoUrl, shareUrl, isOwnerMe } = this.state;
    return (
      <div>
        {isOwnerMe && videoUrl === "" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              Se stai facendo una live youtube di questa partita, inserisci qui
              l'url del video (esempio. https://youtu.be/kdy5MdmZ3TU):
            </div>
            <TextField
              variant="outlined"
              fullWidth
              value={shareUrl}
              onChange={this.handleChange.bind(this)}
            />
            <Button
              variant="contained"
              style={{ margin: "10px auto", display: "block", padding: 15 }}
              color="primary"
              onClick={this.startLive.bind(this)}
            >
              START
            </Button>
          </div>
        )}
        {!isOwnerMe && videoUrl === "" && (
            <div>Il proprietario non sta facendo lo streaming della partita</div>
        )}
        {videoUrl !== "" && (
          <iframe
            style={{ height: 500, width: "100%" }}
            src={videoUrl}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="video"
          />
        )}
      </div>
    );
  }
}

export default GameVideo;
