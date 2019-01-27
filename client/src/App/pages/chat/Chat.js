import React from "react";
import firebase from "firebase/app";
import "firebase/database";
import ls from "local-storage";
import { firebaseConfig } from "../../App";
import "./Chat.scss";

class Chat extends React.Component {
    state = {
        currentGame: null,
        gameRef: null,
        spectator: false,
        ownerId: null,
        chats: []
    }
    chatsRef = null;

    componentDidMount() {
        var userId = "";
        if (this.state.spectator) {
            userId = this.props.match.params.owner;
        } else {
            userId = ls.get("user").id;
        }
        this.setState({ ...this.state, ownerId: userId });
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.db = firebase.app().database();

        this.chatsRef = this.db.ref(
            "users/" + + "/games/" + userId + "/chats"
        );
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
        this.setState({ ...this.state, currentGame: nextProps.currentGame, spectator: nextProps.spectator, gameRef: nextProps.gameRef, chats: data_list });
    }

    componentWillUnmount() {
        this.chatsRef.off("value");
    }

    render() {
        return (<div>
            {this.state != null && this.state.chats.length > 0
                ? this.state.chats.map((message, index) => {
                    var itsMe = message.userId === "SnTg4iqWQ4WnwFkIDhh7WmtTHFo2" ? true : false;
                    var previousMessage = index > 0 ? this.state.chats[index - 1] : null;
                    var sameDate = previousMessage !== null && previousMessage.date === message.date && previousMessage.userId === message.userId ? "same" : "";
                    var sameUser = previousMessage !== null && previousMessage.userId === message.userId ? "same" : "";
                    var float = itsMe ? "right" : "left";
                    var who = itsMe ? "me" : "not-me";
                    return (
                        <div key={message.key} className="message">
                            <div style={{ float: float }} >
                                <div className={"user-image " + sameUser}
                                    style={{ backgroundImage: "url(" + message.pictureUrl + ")" }}></div>
                            </div>
                            <div className="message-info" style={{ float: float }}>
                                <div className={"date " + sameDate} style={{ textAlign: float }}>{(itsMe ? "" : message.name + " - ") + message.date}</div>
                                <div className={"text " + who}>
                                    <div className={"triangle " + who + (sameUser ? " hidden" : "")} ></div>
                                    <div className={"triangle inside " + who + (sameUser ? " hidden" : "")} ></div>
                                    {message.text}
                                </div>
                            </div>
                            <div className="clear"></div>
                        </div>
                    );
                }) : ""}
        </div>)
    }
}

export default Chat;