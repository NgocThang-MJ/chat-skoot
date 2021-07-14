import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getSession, useSession } from "next-auth/client";

import Friends from "../components/message/Friends";
import Chat from "../components/message/Chat";
import Option from "../components/message/Option";

import { IUserProfile } from "../interfaces/UserInterface";

export default function Home() {
  const router = useRouter();
  const [session, loadingSession] = useSession();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<IUserProfile>({
    userId: "",
    username: "",
    imgUrl: `${process.env.NEXT_PUBLIC_USER_IMG}`,
    friend_requests: [],
    friends: [],
  });
  // const socket = io(`${server_url}`);
  // socket.on("connect", () => {
  //   console.log(socket.id, "id socket");
  // });

  // Effect
  useEffect(() => {
    if (!session && !loadingSession) {
      router.push("/");
    }
  }, [session, loadingSession]);

  useEffect(() => {
    const getProfile = async () => {
      const profile = await getSession();
      return profile;
    };
    getProfile()
      .then((profile) => {
        if (!profile) return router.push("/");
        setLoading(false);
        setUserProfile({
          ...userProfile,
          userId: profile?.userId as string,
          username: profile?.user?.name!,
          imgUrl: profile?.user?.image!,
          friend_requests: profile?.friend_requests as Array<string>,
          friends: profile?.friends as Array<string>,
        });
      })
      .catch(() => {
        router.push("/");
      });
  }, []);

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
