import {
  useState,
  FormEvent,
  useEffect,
  useRef,
  KeyboardEvent,
  useCallback,
} from "react";
import Image from "next/image";
import { FaPhoneAlt, FaVideo, FaArrowLeft } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { GrEmoji } from "react-icons/gr";
import axios from "axios";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { v4 as uuidv4 } from "uuid";
import InfiniteScroll from "react-infinite-scroll-component";

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
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [skip, setSkip] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(true);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const observeRef = useRef<HTMLDivElement>(null);
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
    setMessages((oldMessages) => [
      { content: text, sender_id: userProfile.user_id },
      ...oldMessages,
    ]);
    setText("");
    chatBoxRef.current?.scroll(0, chatBoxRef.current.scrollHeight);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      senMsg();
    }
  };

  const fetchMessages = async (room_id: string, skip: number) => {
    const response = await axios.get(
      `${server_url}/api/rooms/messages/${room_id}/${skip}`
    );
    return response.data;
  };

  // const fetchMoreMsgs = async () => {
  //   if (!room?._id) return;
  //   setSkip(skip => skip + 1);
  //   fetchMessages(room?._id).then((data) => {
  //     setMessages([...messages, ...data]);
  //   })
  // }

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

  useEffect(() => {
    socket.on("message", ({ content, sender_id }) => {
      setMessages([{ content, sender_id }, ...messages]);
    });
  }, [messages]);

  useEffect(() => {
    if (!room) return;
    setLoadingMsg(true);
    fetchMessages(room._id, skip).then((data) => {
      setMessages(data);
      chatBoxRef.current?.scroll(0, chatBoxRef.current.scrollHeight);
      setLoadingMsg(false);
    });
  }, [room]);

  // useEffect(() => {
  //   setElement(observeRef.current);
  // }, [observeRef]);

  // const obsCallback = useCallback(
  //   (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
  //     const [entry] = entries;
  //     console.log("intersect");
  //     if (!entry.isIntersecting || !room?._id) return;

  //     setSkip((skip) => skip + 1);
  //     console.log("run", skip);

  //     // fetchMessages(room._id).then((data) => {
  //     //   console.log([...messages, ...data]);
  //     //   setMessages((oldMessages) => [...oldMessages, ...data]);
  //     // });
  //   },
  //   [room?._id, skip]
  // );

  // useEffect(() => {
  //   setSkip(0);
  // }, [room?._id]);

  // Observer
  // useEffect(() => {
  //   console.log("re-run");
  //   // Observer Callback
  //   if (!chatBoxRef.current || !observeRef.current) return;
  //   console.log("pass");
  //   const observer = new IntersectionObserver(obsCallback, {
  //     root: chatBoxRef.current,
  //     rootMargin: "100px",
  //     threshold: 0,
  //   });
  //   observer.observe(observeRef.current);

  //   return () => {
  //     observeRef.current && observer.unobserve(observeRef.current);
  //   };
  // }, [roomSocketId, chatBoxRef, conversation, observeRef]);

  // get reference of oldest msg

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
      className={`flex-grow bg-default border-l border-r z-40 border-gray-600 flex flex-col justify-between transition transform duration-300 ${
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
            className="flex flex-col-reverse flex-grow h-72 max-h-full overflow-scroll lg:overflow-auto lg:overflow-y-auto px-4 py-2 transition-all scroll-chat"
          >
            {/* <InfiniteScroll
              dataLength={messages.length}
              next={fetchMoreMsgs}
              
            > */}
            {!loadingMsg &&
              messages.length > 0 &&
              messages.map((message) => (
                <div
                  className={`flex ${
                    message.sender_id === userProfile.user_id
                      ? "flex-row-reverse"
                      : null
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
            {/* </InfiniteScroll> */}
            <div ref={observeRef}></div>
          </div>
          <div className="w-full mb-3 flex-shrink-0">
            <form className="flex rounded-lg items-center mx-3">
              <input
                placeholder="Search"
                className="text-gray-200 bg-gray-600 w-11/12 py-2 px-2 mr-2 rounded-lg outline-none border-none"
                onChange={onChange}
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
                  } absolute bottom-10 -right-14 lg:-left-full`}
                  ref={emojiRef}
                >
                  <Picker
                    onSelect={addEmoji}
                    theme="dark"
                    title="Chat Skoot"
                    emoji="speech_balloon"
                    perLine={8}
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
