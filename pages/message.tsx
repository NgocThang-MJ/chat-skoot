import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, MouseEvent } from "react";
import { io } from "socket.io-client";
import { signOut, useSession } from "next-auth/client";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { IoMdSend, IoMdMenu, IoMdNotifications } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";
import { useDetectClickOutside } from "react-detect-click-outside";

import { connectToDatabase } from "../util/mongodb.js";

export default function Home() {
  const router = useRouter();
  const [session, loading] = useSession();
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const socket = io(`${server_url}`);
  const [input, setInput] = useState<String>("");
  const [text, setText] = useState<String>("");
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // socket.on("connect", () => {
  //   console.log(socket.id, "id socket");
  // });
  const toggleMenu = () => {
    setMenu(!menu);
  };
  useEffect(() => {
    if (!(session || loading)) {
      router.push("/");
    }
  }, [session, loading]);

  // Event click outside
  useEffect(() => {
    function handleClick(e: any) {
      if (!menu) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(false);
      }
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [menu, menuRef]);

  // Send message
  const onSend = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(text);
    setText("");
  };

  return (
    <>
      {session && !loading ? (
        <div className="h-screen">
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
                    value={input.toString()}
                  />
                </form>
              </div>

              <div className="flex-grow border-r border-gray-600 relative">
                <div className="bg-red-500 flex justify-between items-center">
                  <div>
                    <p>{session.user?.name}</p>
                  </div>
                  <div className="mr-4 flex">
                    <FaPhoneAlt className="h-5 w-5 text-black mr-6 cursor-pointer" />
                    <FaVideo className="h-5 w-5 text-black mr-6 cursor-pointer" />
                  </div>
                </div>

                <div className="absolute bottom-0 w-full mb-3">
                  <form
                    onSubmit={onSend}
                    className="rounded-lg items-center hidden md:flex mx-3"
                  >
                    <input
                      placeholder="Search"
                      className="text-gray-200 bg-gray-600 w-11/12 py-2 px-2 mr-4 rounded-lg outline-none border-none"
                      onChange={(e) => setText(e.target.value)}
                      value={text.toString()}
                    />
                    <button
                      type="submit"
                      className="px-2 hover:bg-gray-600 rounded-full h-9 transition"
                    >
                      <IoMdSend className="h-6 w-6 text-green-500" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="flex-shrink-0 w-80">
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
                  <div className="flex items-center relative">
                    <div className="rounded-full cursor-pointer hover:bg-gray-600 transition p-2">
                      <IoMdNotifications className="h-6 w-6" />
                    </div>
                    <div
                      onClick={toggleMenu}
                      className="rounded-full cursor-pointer hover:bg-gray-600 transition p-2"
                    >
                      <IoMdMenu className="h-6 w-6" />
                    </div>
                    {menu && (
                      <div
                        ref={menuRef}
                        className={`absolute top-full mt-3 bg-gray-900 w-72 right-0 rounded-md`}
                      >
                        <Link href="/profile">
                          <a>
                            <div className="m-3 flex items-center cursor-pointer hover:bg-gray-700 rounded-md p-2 transition border-b border-gray-700">
                              <div className="mr-3 w-12 h-12">
                                <Image
                                  src={session.user?.image!}
                                  width={48}
                                  height={48}
                                  alt="Avatar"
                                  className="rounded-full"
                                />
                              </div>
                              <div>
                                <p>{session.user?.name}</p>
                                <p className="text-gray-500">Profile</p>
                              </div>
                            </div>
                          </a>
                        </Link>

                        <div
                          onClick={() => {
                            signOut({ redirect: false });
                          }}
                          className="text-gray-400 m-3 flex items-center cursor-pointer hover:bg-gray-700 rounded-md p-2 transition"
                        >
                          <FiLogOut className="h-5 w-5 mr-3" />
                          <p>Log Out</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
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
