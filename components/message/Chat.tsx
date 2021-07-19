import { useState, FormEvent, useEffect, useRef } from "react";
import Image from "next/image";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import { debounce } from "lodash";

import socket from "../../util/socket";

import {
  IMessage,
  IUserProfile,
  RoomMember,
  IRoom,
} from "../../interfaces/UserInterface";

export default function Chat(props: {
  userProfile: IUserProfile;
  conversation: RoomMember | undefined;
  room: IRoom | undefined;
  roomSocketId: string;
}) {
  const { conversation, room, userProfile, roomSocketId } = props;
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setText(value);
    // if (!value) {
    //   socket.emit("blur", {
    //     room_socket_id: roomSocketId,
    //     image: userProfile.img_url,
    //   });
    //   setIsTyping(false);
    // }
    // if (value && document.activeElement === inputRef.current) {
    //   if (!isTyping) {
    //     setIsTyping(true);
    //     socket.emit("typing", {
    //       room_socket_id: roomSocketId,
    //       image: userProfile.img_url,
    //     });
    //   }
    // }
  };

  const onBLur = () => {
    socket.emit("blur", {
      room_socket_id: roomSocketId,
      user_id: userProfile.user_id,
    });
    setIsTyping(false);
  };

  const emitTyping = (
    value: string,
    isTyping: boolean,
    room_socket_id: string
  ) => {
    console.log(value);
    console.log(!value);
    if (!value) {
      console.log("emit blur");
      socket.emit("blur", {
        room_socket_id,
        user_id: userProfile.user_id,
      });
      setIsTyping(false);
    } else {
      if (!isTyping) {
        setIsTyping(true);
        console.log("emit typing");
        socket.emit("typing", {
          room_socket_id,
          user_id: userProfile.user_id,
        });
        console.log("emitted typing");
      }
    }
  };

  const debouncedEmitTyping = useRef(
    debounce(
      (value, isTyping, room_socket_id) =>
        emitTyping(value, isTyping, room_socket_id),
      300
    )
  ).current;

  const onKeyUp = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    console.log(value);
    debouncedEmitTyping(value, isTyping, roomSocketId);
  };

  // Send message
  const onSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text) return;
    if (!room) return;
    socket.emit("message", {
      content: text,
      sender_id: userProfile.user_id,
      room_id: room._id,
      room_socket_id: roomSocketId,
    });
    socket.emit("blur", {
      room_socket_id: roomSocketId,
      user_id: userProfile.user_id,
    });
    setMessages((oldMessages) => [
      { content: text, sender_id: userProfile.user_id },
      ...oldMessages,
    ]);
    setText("");
    setIsTyping(false);
    chatBoxRef.current?.scroll(0, chatBoxRef.current.scrollHeight);
  };

  const fetchMessages = async (room_id: string) => {
    const response = await axios.get(
      `${server_url}/api/rooms/messages/${room_id}`
    );
    return response.data;
  };

  useEffect(() => {
    socket.on("typing", ({ user_id }) => {
      console.log(user_id + "typing");
      setTypingUser(typingUser.concat([user_id]));
    });
    socket.on("blur", ({ user_id }) => {
      setIsTyping(false);
      setTypingUser(typingUser.filter((id) => id !== user_id));
    });
  }, [typingUser, isTyping]);

  useEffect(() => {
    socket.on("message", ({ content, sender_id }) => {
      setMessages([{ content, sender_id }, ...messages]);
      console.log("sent");
    });
  }, [messages]);

  useEffect(() => {
    if (!room) return;
    fetchMessages(room._id).then((data) => {
      setMessages(data);
    });
    chatBoxRef.current?.scroll(0, chatBoxRef.current.scrollHeight);
  }, [room]);

  // Clean up
  useEffect(() => {
    return function cleanup() {
      console.log("quit");
      socket.emit("leave room", { room_socket_id: roomSocketId });
      socket.emit("blur", {
        room_socket_id: roomSocketId,
        image: userProfile.img_url,
      });
    };
  }, []);

  return (
    <div className="flex-grow border-r border-gray-600 relative flex flex-col justify-between">
      {conversation && (
        <>
          <div className="flex justify-between items-center border-b border-gray-700 pb-1 flex-shrink-0">
            <div className="flex items-center ml-2">
              <Image
                src={
                  conversation.image || `${process.env.NEXT_PUBLIC_USER_IMG}`
                }
                width={36}
                height={36}
                alt="Avatar"
                className="rounded-full"
              />
              <p className="ml-3">{conversation.name}</p>
            </div>
            <div className="mr-2 flex">
              <FaPhoneAlt className="h-5 w-5 text-red-500 mr-6 cursor-pointer" />
              <FaVideo className="h-5 w-5 text-red-500 mr-4 cursor-pointer" />
            </div>
          </div>
          <div
            ref={chatBoxRef}
            className="flex flex-col-reverse flex-grow max-h-full overflow-y-auto px-4 py-2 transition-all"
          >
            {room &&
              room?.members.map((member) => (
                <div
                  className={`flex items-center ${
                    typingUser.includes(member.id) ? "block" : "hidden"
                  }`}
                  key={member.id}
                >
                  <Image
                    src={member.image || `${process.env.NEXT_PUBLIC_USER_IMG}`}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <p className="ml-2 text-gray-500">is typing...</p>
                </div>
              ))}
            {/* {typingUser.length > 0 &&
              typingUser.map((image, index) => (
                <div className="flex items-center" key={index}>
                  <Image
                    src={image || `${process.env.NEXT_PUBLIC_USER_IMG}`}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <p className="ml-2 text-gray-500">is typing...</p>
                </div>
              ))} */}
            {messages.length > 0 &&
              messages.map((message, index) => (
                <div
                  className={`flex ${
                    message.sender_id === userProfile.user_id &&
                    "flex-row-reverse"
                  } mb-2 transition-all`}
                  key={index}
                >
                  <p
                    className={`${
                      message.sender_id === userProfile.user_id
                        ? "bg-red-600"
                        : "bg-gray-700"
                    } px-3 py-1 rounded-2xl max-w-2/3 break-words transition-all`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
          </div>
          <div className="w-full mb-3 flex-shrink-0">
            <form
              onSubmit={onSend}
              className="rounded-lg items-center hidden md:flex mx-3"
            >
              <input
                placeholder="Search"
                className="text-gray-200 bg-gray-600 w-11/12 py-2 px-2 mr-4 rounded-lg outline-none border-none"
                onChange={onChange}
                onBlur={onBLur}
                onKeyUp={onKeyUp}
                value={text}
                ref={inputRef}
              />
              <button
                type="submit"
                className="px-2 hover:bg-gray-600 rounded-full h-9 transition"
              >
                <IoMdSend className="h-6 w-6 text-green-500" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
