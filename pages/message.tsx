import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession, signOut } from "next-auth/client";
import useSWR from "swr";
import axios from "axios";

import Friends from "../components/message/Friends";
import Chat from "../components/message/Chat";
import Option from "../components/message/Option";

import socket from "../util/socket";

import { IUserProfile } from "../interfaces/UserInterface";

export default function Home() {
  const router = useRouter();
  const [session, loadingSession] = useSession();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
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

  const fetcher = async (url: string, id: string) => {
    if (!id) return;
    console.log(id);
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
  }, [session, loadingSession]);

  // useEffect(() => {
  //   const socket = io(`${server_url}`);
  //   socket.on("connect", () => {
  //     console.log(socket.id, "id socket");
  //   });
  // }, []);

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
          <div className="flex mx-5 h-full text-white pt-4">
            <Friends userProfile={userProfile} />

            <Chat userProfile={userProfile} />

            <Option userProfile={userProfile} setLoading={setLoading} />
          </div>
        </div>
      ) : (
        <p>loading...</p>
      )}
    </>
  );
}
