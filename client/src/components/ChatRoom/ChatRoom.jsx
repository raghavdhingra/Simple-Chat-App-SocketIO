import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "../../assets/ChatRoom/ChatRoom.css";
import swal from "sweetalert";

let socket;
// let ENDPOINT = "localhost:5000";
let ENDPOINT = "https://raghav-chat-server.herokuapp.com/";

const ChatRoom = (props) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const { room, name } = props.match.params;
    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);

    socket.emit("join", { name, room }, (err) => {
      swal(
        "Username already Exists",
        "Please choose a different username",
        "error"
      ).then(() => (window.location.href = "/"));
    });
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [props.match.params]);

  const handleSendButton = () => {
    if (message) {
      console.log(name);
      socket.emit("sendMessage", message);
      setMessage("");
    } else {
      swal("Empty Message Field", "", "warning");
    }
  };

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages([...messages, msg]);
    });
  }, [messages]);

  return (
    <>
      <div className="container">
        <div className="card m-1">
          <div className="chat-container">
            <div>Room: {room}</div>
            <div className="chat-inner">
              {/* Message container */}
              {messages.map((data, index) => (
                <div
                  className="m-1 chat-message-container"
                  key={`message-${index}`}
                >
                  <div>{data.user}:</div>
                  <div>{data.text}</div>
                </div>
              ))}
              {/* Message container */}
            </div>
            <div className="chat-input-grid">
              <div className="justify-center">
                <input
                  className="text-field text-field-1"
                  value={message}
                  placeholder="Type a message to send"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.keyCode === 13 ? handleSendButton() : null
                  }
                />
              </div>
              <div className="justify-center">
                <button onClick={handleSendButton}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
