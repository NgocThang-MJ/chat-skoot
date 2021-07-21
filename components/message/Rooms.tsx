import {
  useEffect,
  useState,
  FormEvent,
  useRef,
  MutableRefObject,
  RefObject,
  useReducer,
} from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { BiSearch } from "react-icons/bi";
import axios from "axios";
import useSWR from "swr";
import TimeAgo from "timeago-react";
import Peer, { Instance, SignalData } from "simple-peer";
import { GrClose } from "react-icons/gr";
import { FaPhone } from "react-icons/fa";

import socket from "../../util/socket";

import {
  IUserProfile,
  IRoom,
  RoomMember,
} from "../../interfaces/UserInterface";

export default function Friend(props: {
  userProfile: IUserProfile;
  setConversation: Function;
  setRoom: Function;
  setRoomSocketId: Function;
  setInCall: Function;
  inCall: boolean;
  connectionRef: MutableRefObject<Instance | undefined>;
  friendsVideoRef: RefObject<HTMLVideoElement>;
  roomIdCall: string;
  setRoomIdCall: Function;
}) {
  const {
    userProfile,
    inCall,
    setInCall,
    connectionRef,
    friendsVideoRef,
    roomIdCall,
    setRoomIdCall,
  } = props;
  // const router = useRouter();
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [input, setInput] = useState("");
  const [ringing, setRinging] = useState(false);
  const [callerSignal, setCallerSignal] = useState<SignalData>();
  const [nameCaller, setNameCaller] = useState("");
  const [imageCaller, setImageCaller] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

  const myVideoRef = useRef<HTMLVideoElement>(null);

  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const fetchRooms = async (user_id: string) => {
    if (!user_id) return;
    const response = await axios.get(`${server_url}/api/rooms/${user_id}`);
    const data: IRoom[] = response.data;
    return data;
  };

  const { data, error } = useSWR(userProfile.user_id, fetchRooms);

  const joinRoom = async (room: IRoom, talker: RoomMember) => {
    socket.emit("join conversation", room.room_socket_id);
    props.setRoom(room);
    props.setRoomSocketId(room.room_socket_id);
    props.setConversation({
      id: talker.id,
      name: talker.name,
      image: talker.image,
    });
  };

  const answer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      const tracks = stream.getTracks();
      setInCall(true);
      setRinging(false);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
      });

      connectionRef.current = peer;

      socket.on("end call", () => {
        console.log("on end call");
        // peer.destroy();
        setRinging(false);
        setInCall(false);
        setNameCaller("");
        setImageCaller("");
        tracks.forEach((track) => track.stop());
        // router.reload();
        // window.location.reload();
        // forceUpdate();
      });

      peer.on("signal", (data) => {
        console.log(roomIdCall);
        socket.emit("answer", { signal_data: data, room_id: roomIdCall });
      });

      peer.on("stream", (stream) => {
        friendsVideoRef.current!.srcObject = stream;
      });
      if (callerSignal) {
        peer.signal(callerSignal);
      }
    } catch (err) {
      alert("Can't get your camera and/or microphone");
    }
  };

  const endCall = () => {
    // connectionRef.current?.destroy();
    console.log(roomIdCall);
    socket.emit("end call", roomIdCall);
    // setRinging(false);
    // setInCall(false);
    // setNameCaller("");
    // setImageCaller("");
  };

  const rejectCall = () => {
    socket.emit("reject call", roomIdCall);
    setRinging(false);
    setInCall(false);
  };

  useEffect(() => {
    socket.on("new message", (updatedRoom: IRoom) => {
      if (!rooms[0]) return;
      const updatedRooms = rooms.filter((room) => room._id !== updatedRoom._id);
      setRooms([updatedRoom, ...updatedRooms]);
    });
  }, [rooms]);

  useEffect(() => {
    socket.on("joined room", (online_ids) => {
      setOnlineUsers(online_ids);
    });
    socket.on("leave room", (user_id) => {
      setOnlineUsers(onlineUsers.filter((id) => id !== user_id));
    });
  }, []);

  useEffect(() => {
    if (data) {
      const ids = data.map((room) => room._id);
      socket.emit("join room", { ids, user_id: userProfile.user_id });
      setRooms(data);
    }
    if (error) {
      console.log(error);
    }
  }, [data, error]);

  useEffect(() => {
    socket.on("call", ({ signal_data, name_caller, image_caller, room_id }) => {
      console.log("room id", room_id);
      setRinging(true);
      setCallerSignal(signal_data);
      setRoomIdCall(room_id);
      setNameCaller(name_caller);
      setImageCaller(image_caller);
    });

    // socket.on("end call", () => {
    //   console.log("on end call");
    //   setRinging(false);
    //   setInCall(false);
    //   if (connectionRef.current) {
    //     connectionRef.current.destroy();
    //   }
    // });

    socket.on("off call", () => {
      console.log("on off call");
      setRinging(false);
      setInCall(false);
      setCallerSignal(undefined);
      setRoomIdCall("");
      setNameCaller("");
      setImageCaller("");
    });

    // socket.on("off call", () => {
    //   console.log("on off call");
    //   setRinging(false);
    //   setInCall(false);
    //   if (connectionRef.current) {
    //     connectionRef.current.destroy();
    //   }
    // });
  }, []);

  // Clean up
  // useEffect(() => {
  //   return function cleanup() {
  //     console.log("quit");
  //     if (!data) return;
  //     const ids = data.map((room) => room._id);
  //     socket.emit("leave room", { ids, user_id: userProfile.user_id });
  //   };
  // }, []);
  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-600 pr-5">
      {ringing && (
        <div className="absolute w-screen h-screen z-30 top-0 right-0 bg-gray-700">
          <div className="mx-auto flex flex-col items-center justify-center h-2/3">
            <Image
              src={imageCaller || `${process.env.NEXT_PUBLIC_USER_IMG}`}
              width={180}
              height={180}
              alt="Avatar"
              className="rounded-full"
            />
            <p className="text-xl">{nameCaller}</p>
            <p>Ringing...</p>
            <div className="mt-4 flex justify-between w-52">
              <div
                onClick={rejectCall}
                className="rounded-full bg-gray-400 p-3 cursor-pointer hover:bg-gray-300"
              >
                <GrClose className="h-6 w-6 text-white" />
              </div>
              <div
                onClick={() => answer()}
                className="rounded-full bg-green-400 p-3 cursor-pointer hover:bg-green-300"
              >
                <FaPhone className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {inCall && (
        <div className="absolute w-screen h-screen z-40 top-0 right-0 bg-gray-700">
          <div className="max-w-screen-lg mx-auto h-full flex items-center justify-center">
            <div className="flex flex-col items-center w-full h-full">
              <div className="flex items-center justify-center w-full h-4/5">
                <div className="mx-2 w-1/3 h-5/6">
                  <video
                    // className="w-72 h-96"
                    autoPlay
                    muted
                    playsInline
                    ref={myVideoRef}
                  />
                </div>
                <div className="mx-2 w-1/3 h-5/6">
                  <video
                    // className="w-72 h-96"
                    autoPlay
                    playsInline
                    ref={friendsVideoRef}
                  />
                </div>
              </div>

              <div
                onClick={endCall}
                className="rounded-full bg-red-500 p-3 cursor-pointer hover:bg-red-600 mt-3 inline-block"
              >
                <FaPhone className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="">
        <p className="text-xl">Friends</p>
        <form
          className="flex bg-gray-600 rounded mt-3 items-center"
          onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
        >
          <button type="submit" className="px-2">
            <BiSearch className="h-5 w-5 text-gray-800" />
          </button>
          <input
            placeholder="Search"
            className="text-gray-300 bg-gray-600 py-1 rounded outline-none border-none"
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </form>
      </div>

      <div className="mt-5">
        {rooms.length > 0 &&
          rooms.map((room) => {
            const talker: RoomMember = room.members.filter(
              (member) => member.id !== userProfile.user_id
            )[0];
            return (
              <div
                className="flex items-center rounded-md hover:bg-gray-700 p-2 cursor-pointer mb-2"
                onClick={() => joinRoom(room, talker)}
                key={room._id}
              >
                <div className="h-11 relative">
                  <Image
                    src={talker.image || `${process.env.NEXT_PUBLIC_USER_IMG}`}
                    width={44}
                    height={44}
                    className="rounded-full"
                  />
                  {onlineUsers.includes(talker.id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </div>
                <div className="ml-2 whitespace-nowrap relative top-1">
                  <p className="overflow-ellipsis overflow-hidden w-40">
                    {talker.name}
                  </p>
                  <div>
                    <span className="text-gray-500 overflow-ellipsis max-w-10 overflow-hidden inline-block">
                      {room.last_msg}
                    </span>
                    <span className="text-gray-500 ml-2 overflow-ellipsis inline-block overflow-hidden">
                      &middot;{" "}
                      <TimeAgo datetime={room.last_date_msg} live={false} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
