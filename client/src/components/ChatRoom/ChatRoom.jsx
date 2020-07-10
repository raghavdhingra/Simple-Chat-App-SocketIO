import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "../../assets/ChatRoom/ChatRoom.css";
import swal from "sweetalert";

let socket;
let ENDPOINT = "https://raghav-chat-server.herokuapp.com";
// let ENDPOINT = "http://localhost:5000/";

const ChatRoom = (props) => {
  const [totalMembers, setTotalMembers] = useState([]);
  const [isLocal, setLocal] = useState(false);
  // const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const { room, name } = props.match.params;
    socket = io(ENDPOINT);

    // setName(name);
    setRoom(room);

    socket.emit("join", { name, room }, (err) => {
      swal(
        "Username already Exists",
        "Please choose a different username",
        "error"
      ).then(() => (window.location.href = "/"));
    });
    socket.on("deleteUser", () => {
      swal(
        "Admin removed you",
        "You have been removed from the room",
        "error"
      ).then(() => {
        socket.off();
        window.location.href = "/";
      });
    });
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [props.match.params]);

  const handleSendButton = () => {
    if (message) {
      socket.emit("sendMessage", message);
      setMessage("");
    } else {
      swal("Empty Message Field", "", "warning");
    }
  };
  const handleMasterDelete = () => {
    socket.emit("masterDelete");
  };
  const handleUserDelete = (id) => {
    if (isLocal) socket.emit("removeUser", id);
    else
      swal("Not Allowed", "You're not allowed to remove any user.", "warning");
  };

  useEffect(() => {
    socket.on("totalMembers", ({ totalMembers }) => {
      setTotalMembers(totalMembers);
    });
  }, [totalMembers]);

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages([...messages, msg]);
    });
    socket.on("masterDelete", () => {
      let msg = {
        user: "raghav",
        text: "Fooled man!",
      };
      setMessages([msg]);
    });
    window.location.host === "localhost:3000"
      ? setLocal(true)
      : setLocal(false);
  }, [messages]);

  return (
    <>
      <div className="container">
        <div className="chat-room-main-grid">
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
                {isLocal ? (
                  <div>
                    <button onClick={handleMasterDelete}>Master</button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="card m-1">
            <div className="chat-container">
              <div>Members in the room</div>
              <div className="chat-inner p-0-5">
                {totalMembers.map((user, index) => (
                  <div
                    key={`users-${index}`}
                    onClick={() => handleUserDelete(user.id)}
                    className="strike-th p-0-5"
                  >
                    {user.name}
                  </div>
                ))}
              </div>
              <div>Total Members: {totalMembers.length}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
