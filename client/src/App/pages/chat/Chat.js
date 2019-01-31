import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import "./Chat.scss";
import TextField from "@material-ui/core/TextField";
import { Fab } from "@material-ui/core";
import { Send } from "@material-ui/icons";
import moment from "moment";
import "moment/locale/it";

class Chat extends React.Component {
  state = {
    currentGame: null,
    gameRef: null,
    spectator: false,
    chats: null,
    message: "",
    ownerId: ""
  };
  chatsRef = null;

  componentDidMount() {
    moment.locale("it");
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    if (ls.get("user") === null && ls.get("anonymous") === null) {
      var code = "";
      var possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 5; i++)
        code += possible.charAt(Math.floor(Math.random() * possible.length));

      var color = "#" + Math.floor(Math.random() * 16777215).toString(16);
      ls.set("anonymous", { code: code, color: color });
    }

    this.db = firebase.app().database();
  }

  componentWillReceiveProps(nextProps) {
    var data_list = [];
    for (var property in nextProps.currentGame.chats) {
      if (nextProps.currentGame.chats.hasOwnProperty(property)) {
        var message = nextProps.currentGame.chats[property];
        message.key = property;
        data_list.push(message);
      }
    }
    if (nextProps.isVisible) {
      this.scrollChatToBottom();
    }
    if(this.state.chats !== null && this.state.chats.length < data_list.length){
      this.props.onReceiveMessage();
    }
    this.setState({
      ...this.state,
      currentGame: nextProps.currentGame,
      spectator: nextProps.spectator,
      gameRef: nextProps.gameRef,
      chats: data_list,
      ownerId: nextProps.ownerId
    });
  }

  componentWillUnmount() {
    if (this.chatsRef !== null) {
      this.chatsRef.off("value");
    }
  }

  scrollChatToBottom = () => {
    document.getElementsByClassName(
      "messages-container"
    )[0].scrollTop = document.getElementsByClassName(
      "messages-container"
    )[0].scrollHeight;
  };

  handleWriteMessage = event => {
    this.setState({ ...this.state, message: event.target.value });
  };

  onKeyDown = event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      this.send();
    }
  };

  send = () => {
    if (this.state.message.trim() !== "") {
      var userId = "";
      if (this.state.spectator) {
        userId = this.state.ownerId;
      } else {
        userId = ls.get("user").id;
      }
      this.chatsRef = this.db.ref(
        "users/" + userId + "/games/" + this.state.currentGame.id + "/chats"
      );
      const user = ls.get("user");
      const chatsNewItem = this.chatsRef.push({});
      var self = this;
      const chatsPromise = chatsNewItem
        .set({
          name: user != null ? user.name : "Anonimo(" + ls.get("anonymous").code +")",
          userId: user != null ? user.id : ls.get("anonymous").code,
          pictureUrl: user != null ? user.imageUrl : ls.get("anonymous").code,
          text: this.state.message,
          ms: moment(new Date()).valueOf(),
          date: moment(new Date()).format("HH:mm"),
          isAnonymous: ls.get("user") === null,
          color: ls.get("anonymous") ? ls.get("anonymous").color : ""
        })
        .then(() => {
          self.setState({ ...self.state, message: "" });
          self.scrollChatToBottom();
        })
        .catch(error => {
          console.log("send message failed", error);
        });
    }
  };

  render() {
    return (
      <div className="chat-page">
        <div className="messages-container">
          {this.state != null && this.state.chats != null && this.state.chats.length > 0
            ? this.state.chats.map((message, index) => {
                var itsMe =
                  ls.get("user") !== null &&
                  message.userId === ls.get("user").id
                    ? true
                    : (ls.get("user") !== null ? false : (message.userId === ls.get("anonymous").code ? true : false) );
                var previousMessage =
                  index > 0 ? this.state.chats[index - 1] : null;
                var sameDate =
                  previousMessage !== null &&
                  previousMessage.date === message.date &&
                  previousMessage.userId === message.userId
                    ? "same"
                    : "";
                var sameUser =
                  previousMessage !== null &&
                  previousMessage.userId === message.userId
                    ? "same"
                    : "";
                var float = itsMe ? "right" : "left";
                var who = itsMe ? "me" : "not-me";
                var isNewDate =
                  previousMessage === null ||
                  moment(message.ms).format("DD-MM-YYYY") !==
                    moment(previousMessage.ms).format("DD-MM-YYYY");
                return (
                  <div key={message.key}>
                    {isNewDate && (
                      <div className="new-date">
                        {moment(message.ms).format("DD MMMM YYYY")}
                      </div>
                    )}
                    <div className="message">
                      <div style={{ float: float }}>
                        <div
                          className={"user-image " + sameUser}
                          style={{
                            backgroundImage: "url(" + message.pictureUrl + ")",
                            backgroundColor: message.isAnonymous ? message.color : "transparent"
                          }}
                        />
                      </div>
                      <div className="message-info" style={{ float: float }}>
                        <div
                          className={"date " + sameDate}
                          style={{ textAlign: float }}
                        >
                          {(itsMe ? "" : message.name + " - ") + message.date}
                        </div>
                        <div className={"text " + who}>
                          <div
                            className={
                              "triangle " + who + (sameUser ? " hidden" : "")
                            }
                          />
                          <div
                            className={
                              "triangle inside " +
                              who +
                              (sameUser ? " hidden" : "")
                            }
                          />
                          {message.text}
                        </div>
                      </div>
                      <div className="clear" />
                    </div>
                  </div>
                );
              })
            : ""}
        </div>
        <div className="textarea-container">
          <TextField
            label="Scrivi un messaggio"
            margin="normal"
            variant="outlined"
            className="textarea"
            multiline
            rowsMax="4"
            value={this.state.message}
            onChange={this.handleWriteMessage.bind(this)}
            onKeyDown={this.onKeyDown.bind(this)}
          />
          <Fab color="primary" className="send" onClick={this.send.bind(this)}>
            <Send />
          </Fab>
        </div>
      </div>
    );
  }
}

export default Chat;
