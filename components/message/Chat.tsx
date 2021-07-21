import {
  useState,
  FormEvent,
  useEffect,
  useRef,
  KeyboardEvent,
  RefObject,
  MutableRefObject,
  useReducer,
  useCallback,
} from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { GrEmoji, GrClose } from "react-icons/gr";
import axios from "axios";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { v4 as uuidv4 } from "uuid";
import Peer, { Instance } from "simple-peer";

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
  setInCall: Function;
  connectionRef: MutableRefObject<Instance | undefined>;
  friendsVideoRef: RefObject<HTMLVideoElement>;
  setRoomIdCall: Function;
}) {
  const {
    conversation,
    room,
    userProfile,
    roomSocketId,
    setInCall,
    friendsVideoRef,
    connectionRef,
    setRoomIdCall,
  } = props;
  // const router = useRouter();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  // const [typingUser, setTypingUser] = useState<string[]>([]);
  // const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(true);
  const [calling, setCalling] = useState(false);
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

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
  const call = async () => {
    // window.open(`http://localhost:3000/call?roomId=${room?._id}`, "_blank");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      const tracks = stream.getTracks();

      setCalling(true);
      setRoomIdCall(room?._id);

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      connectionRef.current = peer;

      peer.on("signal", (data) => {
        socket.emit("call", {
          signal_data: data,
          room_id: room?._id,
          name_caller: userProfile.username,
          image_caller: userProfile.img_url,
        });
      });

      peer.on("stream", (stream) => {
        friendsVideoRef.current!.srcObject = stream;
      });

      socket.on("answer", (signal) => {
        console.log("friend answer");
        peer.signal(signal);
        setInCall(true);
        setCalling(false);
      });

      socket.on("end call", () => {
        console.log("on end call");
        setInCall(false);
        tracks.forEach((track) => track.stop());
        // peer.destroy();
        // router.reload();
        // window.location.reload();
      });

      socket.on("off call", () => {
        // peer.destroy();
        tracks.forEach((track) => track.stop());
      });
      socket.on("reject call", () => {
        console.log("on reject call");
        tracks.forEach((track) => track.stop());
        // peer.destroy();
        setCalling(false);
        setInCall(false);
        // if (connectionRef.current) {
        //   connectionRef.current.destroy();
        // }
      });
    } catch (err) {
      alert("Can't get your camera and/or microphone");
    }
  };

  const offCall = () => {
    socket.emit("off call", room?._id);
    setCalling(false);
    setInCall(false);
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
    <div className="flex-grow border-r border-gray-600 flex flex-col justify-between">
      {calling && (
        <div className="absolute w-screen h-screen z-10 top-0 right-0 bg-gray-700">
          <div className="mx-auto flex flex-col items-center justify-center h-2/3">
            <Image
              src={conversation?.image || `${process.env.NEXT_PUBLIC_USER_IMG}`}
              width={180}
              height={180}
              alt="Avatar"
              className="rounded-full"
            />
            <p className="text-xl">{conversation?.name}</p>
            <p>Calling...</p>
            <div className="mt-4">
              <div
                onClick={offCall}
                className="rounded-full bg-gray-400 p-3 cursor-pointer hover:bg-gray-300"
              >
                <GrClose className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

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
              <FaPhoneAlt
                onClick={call}
                className="h-5 w-5 text-red-500 mr-6 cursor-pointer"
              />
              <FaVideo className="h-5 w-5 text-red-500 mr-4 cursor-pointer" />
            </div>
          </div>
          <div
            ref={chatBoxRef}
            className="flex flex-col-reverse flex-grow max-h-full overflow-y-auto px-4 py-2 transition-all"
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
                    set="facebook"
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
