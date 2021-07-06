import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { signOut, useSession } from "next-auth/client";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { IoMdSend } from "react-icons/io";

import { connectToDatabase } from "../util/mongodb.js";

export default function Home() {
  const router = useRouter();
  const [session, loading] = useSession();
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const socket = io(`${server_url}`);
  const [input, setInput] = useState("");
  const [text, setText] = useState("");

  socket.on("connect", () => {
    console.log(socket.id, "id socket");
  });

  useEffect(() => {
    console.log(session);
    if (!(session || loading)) {
      router.push("/");
    }
  }, [session, loading]);

  if (!session || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="h-screen bg-gray-700">
      <Head>
        <title>Chat Skoot</title>
      </Head>
      {session ? (
        <div className="flex mx-5 h-full text-white pt-4">
          <div className="w-64 flex-shrink-0 border-r border-gray-600">
            <p className="text-xl">Chats</p>
            <form className="bg-gray-500 rounded mr-5 mt-3 items-center hidden md:flex">
              <button type="submit" className="px-2">
                <BiSearch className="h-5 w-5 text-gray-800" />
              </button>
              <input
                placeholder="Search"
                className="text-gray-300 bg-gray-500 py-1 rounded outline-none border-none"
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
            </form>
          </div>

          <div className="flex-grow border-r border-gray-600 relative">
            <div className="bg-red-500 flex justify-between items-center">
              <div>
                <p>{session.user?.name}</p>
              </div>
              <div className="mr-4 flex">
                <FaPhoneAlt className="h-5 w-5 text-black mr-8" />
                <FaVideo className="h-5 w-5 text-black mr-6" />
              </div>
            </div>

            <div className="absolute bottom-0 w-full mb-3">
              <form className="rounded-lg items-center hidden md:flex mx-3">
                <input
                  placeholder="Search"
                  className="text-gray-200 bg-gray-600 w-11/12 py-1 px-2 mr-4 rounded-lg outline-none border-none"
                  onChange={(e) => setText(e.target.value)}
                  value={text}
                />
                <button
                  type="submit"
                  className="px-2 hover:bg-gray-600 rounded-full h-8 transition"
                >
                  <IoMdSend className="h-6 w-6 text-green-500" />
                </button>
              </form>
            </div>
          </div>

          <div className="flex-shrink-0 w-72">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="mx-2 h-8">
                  <Image
                    src={session.user?.image!}
                    width={32}
                    height={32}
                    alt="Avatar"
                    className="rounded-full"
                  />
                </div>
                <p>{session.user?.name}</p>
              </div>
              <button
                className="text-white bg-blue-500 p-2"
                onClick={() => {
                  signOut({ redirect: false });
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// export async function getStaticProps() {
//   const { db } = await connectToDatabase();
//   const movies = await db.collection("movies").find({}).limit(20).toArray();
//   console.log("db connected");

//   return {
//     props: { movies: JSON.parse(JSON.stringify(movies)) },
//   };
// }
