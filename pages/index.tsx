import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { signIn, useSession } from "next-auth/client";
import { FaGithub, FaDiscord, FaFacebookSquare } from "react-icons/fa";

export default function Home() {
  const [session, loadingSession] = useSession();
  const router = useRouter();
  // const socket = io("http://localhost:5000");
  // socket.on("connect", () => {
  //   console.log(socket.id, "id socket");
  // });

  useEffect(() => {
    if (localStorage.getItem("session.user")) {
      router.push("/message");
    }
    if (session) {
      localStorage.setItem("session.user", (session?.user_id as string) || "");
      router.push("/message");
    }
  }, [session, loadingSession]);

  return (
    <div>
      <Head>
        <title>Chat Skoot</title>
      </Head>
      {!session && !loadingSession ? (
        <div className="max-w-screen-2xl w-11/12 mx-auto flex flex-row justify-between items-start h-full mt-14">
          <div>
            <p className="text-5xl text-red-500">Chat Skoot</p>
            <p className="mt-2 text-gray-200">
              Free message, voice call and video call, connect all people over
              the world!
            </p>
            <div
              onClick={() => {
                signIn("google", {
                  redirect: false,
                });
              }}
              className="bg-blue-500 border border-blue-500 mt-6 text-white cursor-pointer rounded flex flex-row justify-between items-center w-64"
            >
              <div className="bg-white w-10 h-10 flex justify-center items-center rounded">
                <Image src="/google.png" width={20} height={20} alt="Google" />
              </div>
              <div className="mx-auto">
                <p className="mx-4 font-bold">Continue with Google</p>
              </div>
            </div>
            <div
              onClick={() => {
                signIn("facebook", {
                  redirect: false,
                });
              }}
              className="bg-facebook border border-blue-500 mt-3 text-white cursor-pointer rounded flex flex-row justify-between items-center w-64"
            >
              <div className="w-10 h-10 flex justify-center items-center rounded">
                <FaFacebookSquare className="w-8 h-8" />
              </div>
              <div className="mx-auto">
                <p className="mx-4 font-bold">Continue with Facebook</p>
              </div>
            </div>
            <div
              onClick={() => {
                signIn("github", {
                  redirect: false,
                });
              }}
              className="bg-gray-900 border border-gray-900 mt-3 text-white cursor-pointer rounded flex flex-row justify-between items-center w-64"
            >
              <div className="w-10 h-10 flex justify-center items-center rounded">
                <FaGithub className="w-7 h-7" />
              </div>
              <div className="mx-auto">
                <p className="mx-4 font-bold">Continue with Github</p>
              </div>
            </div>
            <div
              onClick={() => {
                signIn("discord", {
                  redirect: false,
                });
              }}
              className="bg-indigo-700 border border-indigo-700 mt-3 text-white cursor-pointer rounded flex flex-row justify-between items-center w-64"
            >
              <div className="w-10 h-10 flex justify-center items-center rounded">
                <FaDiscord className="w-7 h-7" />
              </div>
              <div className="mx-auto">
                <p className="mx-4 font-bold">Continue with Discord</p>
              </div>
            </div>
          </div>
          <div>
            <img
              src="/landing.svg"
              alt="Landing Image"
              width={580}
              height={360}
            />
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
