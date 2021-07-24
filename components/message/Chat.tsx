import { useState, FormEvent, useEffect, useRef, KeyboardEvent } from "react";
import Image from "next/image";
import { FaPhoneAlt, FaVideo, FaArrowLeft } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { GrEmoji } from "react-icons/gr";
import axios from "axios";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { v4 as uuidv4 } from "uuid";

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
  setRoomIdCall: Function;
  displayChat: Boolean;
  setDisplayChat: Function;
}) {
  const {
    conversation,
    room,
    userProfile,
    roomSocketId,
    setRoomIdCall,
    displayChat,
    setDisplayChat,
  } = props;
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  // const [typingUser, setTypingUser] = useState<string[]>([]);
  // const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(true);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const client_url = process.env.NEXT_PUBLIC_CLIENT_URL;

  const onChange = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setText(value);
  };

  const addEmoji = (e: any) => {
    console.log(e);
    if (e.native) {
      setText(text + e.native);
    }
  };

  const senMsg = () => {
    if (!text) return;
    if (!room) return;
    socket.emit("message", {
      content: text,
      sender_id: userProfile.user_id,
      room_id: room._id,
      room_socket_id: roomSocketId,
    });
    // socket.emit("blur", {
    //   room_socket_id: roomSocketId,
    //   user_id: userProfile.user_id,
    // });
    setMessages((oldMessages) => [
      { content: text, sender_id: userProfile.user_id },
      ...oldMessages,
    ]);
    setText("");
    // setIsTyping(false);
    chatBoxRef.current?.scroll(0, chatBoxRef.current.scrollHeight);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      senMsg();
    }
  };

  // const onBLur = () => {
  //   socket.emit("blur", {
  //     room_socket_id: roomSocketId,
  //     user_id: userProfile.user_id,
  //   });
  //   setIsTyping(false);
  // };

  // const emitTyping = (
  //   value: string,
  //   isTyping: boolean,
  //   room_socket_id: string
  // ) => {
  //   console.log(value);
  //   console.log(!value);
  //   if (!value) {
  //     console.log("emit blur");
  //     socket.emit("blur", {
  //       room_socket_id,
  //       user_id: userProfile.user_id,
  //     });
  //     setIsTyping(false);
  //   } else {
  //     if (!isTyping) {
  //       setIsTyping(true);
  //       console.log("emit typing");
  //       socket.emit("typing", {
  //         room_socket_id,
  //         user_id: userProfile.user_id,
  //       });
  //       console.log("emitted typing");
  //     }
  //   }
  // };

  // const debouncedEmitTyping = useRef(
  //   debounce(
  //     (value, isTyping, room_socket_id) =>
  //       emitTyping(value, isTyping, room_socket_id),
  //     300
  //   )
  // ).current;

  // const onKeyUp = (e: FormEvent<HTMLInputElement>) => {
  //   const value = e.currentTarget.value;
  //   console.log(value);
  //   debouncedEmitTyping(value, isTyping, roomSocketId);
  // };

  const fetchMessages = async (room_id: string) => {
    const response = await axios.get(
      `${server_url}/api/rooms/messages/${room_id}`
    );
    return response.data;
  };

  // Call
  const call = (option: { video: boolean; audio: boolean }) => {
    localStorage.setItem("name_caller", userProfile.username);
    localStorage.setItem("img_caller", userProfile.img_url);
    localStorage.setItem("name_talker", conversation?.name as string);
    localStorage.setItem("img_talker", conversation?.image as string);

    const { video, audio } = option;

    window.open(
      `${client_url}/call?room_id=${room?._id}&socket_id=${socket.id}&video=${video}&audio=${audio}`
    );

    setRoomIdCall(room?._id);
  };

  // Effect

  // useEffect(() => {
  //   socket.on("typing", ({ user_id }) => {
  //     console.log(user_id + "typing");
  //     setTypingUser(typingUser.concat([user_id]));
  //   });
  //   socket.on("blur", ({ user_id }) => {
  //     setIsTyping(false);
  //     setTypingUser(typingUser.filter((id) => id !== user_id));
  //   });
  // }, [typingUser, isTyping]);

  useEffect(() => {
    socket.on("message", ({ content, sender_id }) => {
      setMessages([{ content, sender_id }, ...messages]);
    });
  }, [messages]);

  useEffect(() => {
    if (!room) return;
    setLoadingMsg(true);
    fetchMessages(room._id).then((data) => {
      setMessages(data);
      setLoadingMsg(false);
    });
    chatBoxRef.current?.scroll(0, chatBoxRef.current.scrollHeight);
  }, [room]);

  // Event click outside
  useEffect(() => {
    function handleClickOutsideEmoji(e: any) {
      if (!showEmoji) return;
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    }
    window.addEventListener("click", handleClickOutsideEmoji);
    return () => {
      window.removeEventListener("click", handleClickOutsideEmoji);
    };
  }, [showEmoji]);

  return (
    <div
      className={`flex-grow bg-default border-l border-r z-10 border-gray-600 flex flex-col justify-between transition transform ${
        displayChat ? "translate-x-0" : "-translate-x-full"
      } lg:static lg:transform-none lg:border-l-0`}
    >
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
              <FaArrowLeft
                onClick={() => setDisplayChat(false)}
                className="h-5 w-5 text-red-500 mr-6 lg:hidden"
              />
              <FaPhoneAlt
                onClick={() => call({ video: false, audio: true })}
                className="h-5 w-5 text-red-500 mr-6 cursor-pointer"
              />
              <FaVideo
                onClick={() => call({ video: true, audio: true })}
                className="h-5 w-5 text-red-500 mr-4 cursor-pointer"
              />
            </div>
          </div>
          <div
            ref={chatBoxRef}
            className="flex flex-col-reverse flex-grow h-72 max-h-full overflow-y-scroll lg:overflow-y-auto px-4 py-2 transition-all scroll-chat relative"
          >
            {/* {room &&
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
              ))} */}
            {!loadingMsg &&
              messages.length > 0 &&
              messages.map((message) => (
                <div
                  className={`flex ${
                    message.sender_id === userProfile.user_id &&
                    "flex-row-reverse"
                  } mb-2 transition-all`}
                  key={uuidv4()}
                >
                  <p
                    className={`${
                      message.sender_id !== userProfile.user_id
                        ? "bg-gray-700"
                        : "bg-red-600"
                    } px-3 py-1 rounded-2xl max-w-2/3 break-words transition-all`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
          </div>
          <div className="w-full mb-3 flex-shrink-0">
            <form className="flex rounded-lg items-center mx-3">
              <input
                placeholder="Search"
                className="text-gray-200 bg-gray-600 w-11/12 py-2 px-2 mr-2 rounded-lg outline-none border-none"
                onChange={onChange}
                // onBlur={onBLur}
                // onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                value={text}
                ref={inputRef}
              />
              <div className="relative mx-1">
                <div
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="hover:bg-gray-600 p-2 cursor-pointer rounded-2xl"
                >
                  <GrEmoji className="h-6 w-6" />
                </div>
                <div
                  className={`${
                    !showEmoji && "hidden"
                  } absolute bottom-10 -left-full z-20`}
                  ref={emojiRef}
                >
                  <Picker
                    onSelect={addEmoji}
                    theme="dark"
                    title="Chat Skoot"
                    emoji="speech_balloon"
                  />
                </div>
              </div>
              <div
                onClick={() => senMsg()}
                className="flex items-center cursor-pointer p-2 hover:bg-gray-600 rounded-2xl"
              >
                <IoMdSend className="h-6 w-6 text-green-500" />
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
