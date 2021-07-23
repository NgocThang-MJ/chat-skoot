import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/client";
import useSWR from "swr";
import axios from "axios";

import Rooms from "../components/message/Rooms";
import Chat from "../components/message/Chat";
import Option from "../components/message/Option";

import socket from "../util/socket";

import { IUserProfile, RoomMember, IRoom } from "../interfaces/UserInterface";

export default function Home() {
  const router = useRouter();
  const [session, loadingSession] = useSession();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<IRoom>();
  const [roomIdCall, setRoomIdCall] = useState("");
  const [roomSocketId, setRoomSocketId] = useState("");
  const [conversation, setConversation] = useState<RoomMember>();
  const [userProfile, setUserProfile] = useState<IUserProfile>({
    user_id: "",
    username: "",
    email: "",
    img_url: `${process.env.NEXT_PUBLIC_USER_IMG}`,
    img_name: "",
    friend_requests: [],
    friends: [],
  });
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  // Responsive
  const [displayProfile, setDisplayProfile] = useState(false);
  const [displayChat, setDisplayChat] = useState(false);

  const fetcher = async (url: string, id: string) => {
    if (!id) return;
    const response = await axios.get(`${url}/${id}`);
    return response.data;
  };

  const { data, error } = useSWR([`${server_url}/api/users`, id], fetcher);

  // Effect
  useEffect(() => {
    if (!session && !loadingSession) {
      localStorage.removeItem("session.user");
      router.push("/");
    }
    if (session) {
      socket.connect();
      socket.on("connect", () => {
        console.log(socket.id, "id socket");
      });
    }
  }, [session, loadingSession]);

  useEffect(() => {
    if (localStorage.getItem("session.user")) {
      setId(localStorage.getItem("session.user") || "");
    } else {
      localStorage.removeItem("session.user");
      signOut({ redirect: false, callbackUrl: "/" });
    }
  }, []);

  useEffect(() => {
    if (error) {
      localStorage.removeItem("session.user");
      signOut({ redirect: false, callbackUrl: "/" });
    }
    if (data) {
      setUserProfile({
        ...userProfile,
        user_id: data._id,
        username: data.name,
        img_url: data.image,
        friend_requests: data.friend_requests || [],
        friends: data.friends || [],
      });
      setLoading(false);
    }
  }, [data, error]);

  return (
    <>
      {!loading ? (
        <div className="h-screen">
          <Head>
            <title>Chat Skoot</title>
          </Head>
          <div className="flex mx-8 h-full overflow-hidden relative text-white pt-6 lg:mx-5 lg:pt-4 lg:static">
            <Rooms
              userProfile={userProfile}
              setConversation={setConversation}
              setRoom={setRoom}
              setRoomSocketId={setRoomSocketId}
              roomIdCall={roomIdCall}
              setRoomIdCall={setRoomIdCall}
              setDisplayProfile={setDisplayProfile}
              setDisplayChat={setDisplayChat}
            />

            <Chat
              userProfile={userProfile}
              conversation={conversation}
              room={room}
              roomSocketId={roomSocketId}
              setRoomIdCall={setRoomIdCall}
              displayChat={displayChat}
              setDisplayChat={setDisplayChat}
            />

            <Option
              userProfile={userProfile}
              setLoading={setLoading}
              displayProfile={displayProfile}
              setDisplayProfile={setDisplayProfile}
            />
          </div>
        </div>
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}
