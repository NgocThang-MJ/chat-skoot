import { useState, FormEvent, useEffect, useRef } from "react";
import Image from "next/image";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";

import socket from "../../util/socket";

import {
  IMessage,
  IUserProfile,
  RoomMember,
} from "../../interfaces/UserInterface";
import axios from "axios";

export default function Chat(props: {
  userProfile: IUserProfile;
  conversation: RoomMember | undefined;
  roomId: string;
}) {
  const { conversation, roomId, userProfile } = props;
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Send message
  const onSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("message", {
      content: text,
      sender_id: userProfile.user_id,
      room_id: roomId,
    });
    setText("");
  };

  const fetchMessages = async () => {
    const response = await axios.get(
      `${server_url}/api/rooms/messages/${roomId}`
    );
    return response.data;
  };

  // useEffect(() => {

  // }, [])

  useEffect(() => {
    socket.on("message", ({ _id, room_id, content, sender_id, createdAt }) => {
      setMessages(
        [{ _id, room_id, content, sender_id, createdAt }].concat(messages)
      );
      chatBoxRef.current?.scroll(0, chatBoxRef.current.scrollHeight);
    });
  }, [messages]);

  useEffect(() => {
    if (!roomId) return;
    fetchMessages().then((messages) => {
      setMessages(messages);
      chatBoxRef.current?.scroll(0, chatBoxRef.current.scrollHeight);
    });
  }, [roomId]);

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
            className="flex flex-col-reverse flex-grow max-h-full overflow-y-auto px-4 py-2"
          >
            {messages.length > 0 &&
              messages.map((message) => (
                <div
                  className={`flex ${
                    message.sender_id === userProfile.user_id &&
                    "flex-row-reverse"
                  } mb-2`}
                  key={message._id}
                >
                  <p
                    className={`${
                      message.sender_id === userProfile.user_id
                        ? "bg-red-600"
                        : "bg-gray-700"
                    } px-3 py-1 rounded-2xl max-w-2/3 break-words`}
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
                onChange={(e) => setText(e.target.value)}
                value={text}
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
