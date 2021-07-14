import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, MouseEvent, FormEvent } from "react";
import { io } from "socket.io-client";
import { signOut, getSession, useSession } from "next-auth/client";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { IoMdSend, IoMdMenu, IoMdNotifications } from "react-icons/io";
import { FiLogOut } from "react-icons/fi";
import { GoTelescope } from "react-icons/go";
import { debounce } from "lodash";
import axios from "axios";

interface ISearchedUser {
  _id: string;
  name: string;
  image: string;
}

interface IUserProfile {
  userId: string;
  username: string;
  imgUrl: string;
  friend_requests: string[];
}

interface IRequestUser {
  _id: string;
  name: string;
  image: string;
}

export default function Home() {
  const router = useRouter();
  const [session, loadingSession] = useSession();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<IUserProfile>({
    userId: "",
    username: "",
    imgUrl: `${process.env.NEXT_PUBLIC_USER_IMG}`,
    friend_requests: [],
  });
  const [searchedUsers, setSearchedUsers] = useState<ISearchedUser[]>([]);
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  // const socket = io(`${server_url}`);
  const [input, setInput] = useState<String>("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [inputFriend, setInputFriend] = useState("");
  const [text, setText] = useState<String>("");
  const [menu, setMenu] = useState(false);
  const [notification, setNotification] = useState(false);
  const [requestUsers, setRequestUsers] = useState<IRequestUser[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  // socket.on("connect", () => {
  //   console.log(socket.id, "id socket");
  // });
  const toggleMenu = () => {
    setMenu(!menu);
  };
  const logout = () => {
    setLoading(true);
    signOut({ redirect: false, callbackUrl: "/" });
  };

  // Search user
  const searchUser = async (ownerId: string, query: string) => {
    try {
      setSearching(true);
      setSearchedUsers([]);
      setNotFound(false);
      const response = await axios.post(`${server_url}/api/users/search`, {
        query,
      });
      const filteredUsers: ISearchedUser[] = response.data.users.filter(
        (user: ISearchedUser) => {
          return user._id != ownerId;
        }
      );
      setSearching(false);
      !filteredUsers.length ? setNotFound(true) : setNotFound(false);
      setSearchedUsers(filteredUsers);
    } catch (err) {
      console.log(err);
      setSearching(false);
    }
  };

  const debouncedSearch = useRef(
    debounce((ownerId, query) => searchUser(ownerId, query), 500)
  ).current;

  const handleChange = async (e: FormEvent<HTMLInputElement>) => {
    setInput(e.currentTarget.value);
    if (e.currentTarget.value.length < 3) {
      setSearchedUsers([]);
      setNotFound(false);
      return;
    }
    debouncedSearch(userProfile.userId, e.currentTarget.value);
  };

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
        });
      })
      .catch(() => {
        router.push("/");
      });
  }, []);

  useEffect(() => {
    if (!userProfile.friend_requests.length) return;
    const getRequestUsers = async () => {
      const response = await axios.post(`${server_url}/api/users`, {
        ids: userProfile.friend_requests,
      });
      console.log(response.data);
      return response.data;
    };
    getRequestUsers().then((users) => setRequestUsers(users));
  }, [userProfile]);

  // Event click outside
  useEffect(() => {
    function handleClickOutsideMenu(e: any) {
      if (!menu) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(false);
      }
    }
    function handleClickOutsideNotification(e: any) {
      if (!notification) return;
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotification(false);
      }
    }
    window.addEventListener("click", handleClickOutsideMenu);
    window.addEventListener("click", handleClickOutsideNotification);
    return () => {
      window.removeEventListener("click", handleClickOutsideMenu);
      window.removeEventListener("click", handleClickOutsideNotification);
    };
  }, [menu, menuRef, notification, notificationRef]);

  // Send message
  const onSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(text);
    setText("");
  };

  return (
    <>
      {!loading ? (
        <div className="h-screen">
          <Head>
            <title>Chat Skoot</title>
          </Head>
          <div className="flex mx-5 h-full text-white pt-4">
            <div className="w-64 flex-shrink-0 border-r border-gray-600">
              <p className="text-xl">Chats</p>
              <form
                className="bg-gray-600 rounded mr-5 mt-3 items-center hidden md:flex"
                onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
              >
                <button type="submit" className="px-2">
                  <BiSearch className="h-5 w-5 text-gray-800" />
                </button>
                <input
                  placeholder="Search"
                  className="text-gray-300 bg-gray-600 py-1 rounded outline-none border-none"
                  onChange={(e) => setInputFriend(e.target.value)}
                  value={inputFriend}
                />
              </form>
            </div>

            <div className="flex-grow border-r border-gray-600 relative">
              <div className="flex justify-between items-center border-b border-gray-700 pb-1">
                <div className="flex items-center ml-2">
                  <Image
                    src={
                      userProfile.imgUrl ||
                      `${process.env.NEXT_PUBLIC_USER_IMG}`
                    }
                    width={36}
                    height={36}
                    alt="Avatar"
                    className="rounded-full"
                  />
                  <p className="ml-3">{userProfile.username}</p>
                </div>
                <div className="mr-2 flex">
                  <FaPhoneAlt className="h-5 w-5 text-red-500 mr-6 cursor-pointer" />
                  <FaVideo className="h-5 w-5 text-red-500 mr-4 cursor-pointer" />
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

            <div className="flex-shrink-0 w-80 px-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-2 h-8">
                    <Image
                      src={
                        userProfile.imgUrl ||
                        `${process.env.NEXT_PUBLIC_USER_IMG}`
                      }
                      width={32}
                      height={32}
                      alt="Avatar"
                      className="rounded-full"
                    />
                  </div>
                  <p>{userProfile.username}</p>
                </div>
                <div className="flex items-center relative">
                  <div
                    onClick={() => setNotification(!notification)}
                    className="rounded-full cursor-pointer hover:bg-gray-600 transition p-2 relative mr-2"
                  >
                    <IoMdNotifications className="h-6 w-6" />
                    {userProfile.friend_requests.length > 0 && (
                      <div className="bg-red-500 text-white absolute top-0 text-sm rounded-full right-0 px-1">
                        {userProfile.friend_requests.length}
                      </div>
                    )}
                  </div>

                  {notification && (
                    <div
                      ref={notificationRef}
                      className="absolute top-full bg-gray-900 p-3 rounded-md right-3/4 z-10 w-64"
                    >
                      {requestUsers.length > 0 ? (
                        requestUsers.map((user) => (
                          <Link href={`/profile/${user._id}`} key={user._id}>
                            <a>
                              <div className="flex items-center hover:bg-gray-700 transition rounded-md p-2">
                                <Image
                                  src={
                                    user.image ||
                                    `${process.env.NEXT_PUBLIC_USER_IMG}`
                                  }
                                  width={36}
                                  height={36}
                                  alt="Avatar"
                                  className="rounded-full"
                                />
                                <div className="ml-3">
                                  <p>{user.name}</p>
                                  <p className="text-sm text-gray-400">
                                    Sent you a friend request
                                  </p>
                                </div>
                              </div>
                            </a>
                          </Link>
                        ))
                      ) : (
                        <p className="text-white">
                          You don't have notification yet
                        </p>
                      )}
                    </div>
                  )}
                  <div
                    onClick={toggleMenu}
                    className="rounded-full cursor-pointer hover:bg-gray-600 transition p-2"
                  >
                    <IoMdMenu className="h-6 w-6" />
                  </div>
                  {menu && (
                    <div
                      ref={menuRef}
                      className={`absolute top-full mt-3 bg-gray-900 w-72 right-0 rounded-md z-10`}
                    >
                      <Link href="/profile">
                        <a>
                          <div className="m-3 flex items-center cursor-pointer hover:bg-gray-700 rounded-md p-2 transition border-b border-gray-700">
                            <div className="mr-3 w-12 h-12">
                              <Image
                                src={
                                  userProfile.imgUrl ||
                                  `${process.env.NEXT_PUBLIC_USER_IMG}`
                                }
                                width={48}
                                height={48}
                                alt="Avatar"
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <p>{userProfile.username}</p>
                              <p className="text-gray-500">Profile</p>
                            </div>
                          </div>
                        </a>
                      </Link>

                      <div
                        onClick={logout}
                        className="text-gray-400 m-3 flex items-center cursor-pointer hover:bg-gray-700 rounded-md p-2 transition"
                      >
                        <FiLogOut className="h-5 w-5 mr-3" />
                        <p>Log Out</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 relative">
                <form
                  className="bg-gray-600 rounded mr-5 mt-3 items-center hidden md:flex"
                  onSubmit={(e: MouseEvent<HTMLFormElement>) =>
                    e.preventDefault()
                  }
                >
                  <button type="submit" className="px-2">
                    <BiSearch className="h-5 w-5 text-gray-800" />
                  </button>
                  <input
                    placeholder="Search in Chat Skoot"
                    className="text-gray-300 bg-gray-600 py-1 rounded outline-none border-none"
                    onChange={handleChange}
                    value={input.toString()}
                  />
                </form>
                {searchedUsers.length > 0 && (
                  <div className="absolute top-full bg-gray-900 p-3 rounded-md w-5/6">
                    {searchedUsers.map((user) => (
                      <Link href={`/profile/${user._id}`} key={user._id}>
                        <a>
                          <div className="flex items-center hover:bg-gray-700 transition rounded-md p-2">
                            <Image
                              src={
                                user.image ||
                                `${process.env.NEXT_PUBLIC_USER_IMG}`
                              }
                              width={36}
                              height={36}
                              alt="Avatar"
                              className="rounded-full"
                            />
                            <p className="ml-3">{user.name}</p>
                          </div>
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
                {input.length > 2 && notFound && (
                  <div className="absolute top-full bg-gray-900 p-3 rounded-md w-5/6">
                    <div className="flex items-center">
                      <GoTelescope className="text-gray-400 h-8 w-8" />
                      <p className="text-gray-400 ml-4">
                        Can't find user {input}
                      </p>
                    </div>
                  </div>
                )}
                {searching && (
                  <div className="absolute top-full bg-gray-900 p-3 rounded-md w-5/6">
                    <div className="flex items-center">
                      <GoTelescope className="text-gray-400 h-8 w-8" />
                      <p className="text-gray-400 ml-4">Searching...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>loading...</p>
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
