import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { IoMdArrowBack } from "react-icons/io";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import useSWR from "swr";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";

import { IAnotherProfile, IUserProfile } from "../../interfaces/UserInterface";

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [userProfile, setUserProfile] = useState<IUserProfile>({
    user_id: "",
    email: "",
    username: "",
    img_url: `${process.env.NEXT_PUBLIC_USER_IMG}`,
    img_name: "",
    friend_requests: [],
    friends: [],
  });
  const [anotherProfile, setAnotherProfile] = useState<IAnotherProfile>({
    user_id: "",
    name: "",
    img_url: `${process.env.NEXT_PUBLIC_USER_IMG}`,
    friendRequests: [],
  });
  const [loading, setLoading] = useState(false);

  const fetcher = async (url: string, id: string) => {
    if (!id) return;
    const response = await axios.get(`${url}/${id}`);
    return response.data;
  };

  const { data, error } = useSWR([`${server_url}/api/users`, id], fetcher);

  // Send Friend Request
  const sendFriendRequest = async () => {
    try {
      if (anotherProfile.friendRequests.includes(userProfile.user_id)) return;
      await axios.post(`${server_url}/api/users/friend-request`, {
        senderId: userProfile.user_id,
        receiverId: anotherProfile.user_id,
      });
      setAnotherProfile({
        ...anotherProfile,
        friendRequests: anotherProfile.friendRequests.concat(
          userProfile.user_id
        ),
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Approve Request Friend
  const approveRequest = async () => {
    try {
      await axios.post(`${server_url}/api/users/approve-request`, {
        user_id: userProfile.user_id,
        friend_id: anotherProfile.user_id,
        user_image: userProfile.img_url,
        friend_image: anotherProfile.img_url,
        user_name: userProfile.username,
        friend_name: anotherProfile.name,
      });
      setUserProfile({
        ...userProfile,
        friends: userProfile.friends.concat(anotherProfile.user_id),
        friend_requests: userProfile.friend_requests.filter(
          (request) => request !== anotherProfile.user_id
        ),
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (error) {
      router.push("/message");
    }
    if (data) {
      setAnotherProfile({
        ...anotherProfile,
        user_id: data._id,
        img_url: data.image,
        name: data.name,
        friendRequests: data.friend_requests || [],
      });
    }
  }, [data, error]);

  useEffect(() => {
    const getProfile = async () => {
      const profile = await getSession();
      return profile;
    };
    setLoading(true);
    getProfile()
      .then((profile) => {
        if (!profile) return router.push("/");
        setUserProfile({
          ...userProfile,
          user_id: profile?.user_id as string,
          friend_requests: (profile?.friend_requests as Array<string>) || [],
          friends: profile?.friends as Array<string>,
          img_url: (profile?.user?.image as string) || "",
          username: profile?.user?.name || "",
        });
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, []);

  return (
    <div className="w-2/3 pt-8 mx-auto">
      <Head>
        <title>Profile</title>
      </Head>
      {data && !error ? (
        <div>
          <Link href="/message">
            <a>
              <div className="inline-block hover:bg-gray-700 transition rounded-full p-2">
                <IoMdArrowBack className="h-7 w-7 text-gray-400 cursor-pointer" />
              </div>
            </a>
          </Link>
          <div className="flex mb-5">
            <div className="mr-10">
              <Image
                src={anotherProfile.img_url}
                width={160}
                height={160}
                objectFit="contain"
                className="rounded-full"
              />
            </div>
            <div className="mt-8">
              <p className="text-white text-2xl">{anotherProfile.name}</p>
            </div>
          </div>

          <div className="inline-block">
            {!loading &&
              !userProfile.friends.includes(anotherProfile.user_id) &&
              !userProfile.friend_requests.includes(anotherProfile.user_id) && (
                <div
                  onClick={sendFriendRequest}
                  className="p-2 hover:bg-gray-700 transition rounded-md cursor-pointer flex items-center"
                >
                  <FaUserPlus
                    className={`h-7 w-7 ${
                      anotherProfile.friendRequests.includes(
                        userProfile.user_id
                      )
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                  {anotherProfile.friendRequests.includes(
                    userProfile.user_id
                  ) && <p className="text-blue-500 ml-2">Pending</p>}
                </div>
              )}
            {!loading &&
              userProfile.friend_requests.includes(anotherProfile.user_id) && (
                <div
                  onClick={approveRequest}
                  className="p-2 hover:bg-gray-700 transition rounded-md cursor-pointer flex items-center"
                >
                  <FaUserPlus className={`h-7 w-7 text-blue-500`} />
                  <p className="text-blue-500 ml-2">Approve</p>
                </div>
              )}
            {!loading && userProfile.friends.includes(anotherProfile.user_id) && (
              <div className="p-2 hover:bg-gray-700 transition rounded-md cursor-pointer flex items-center">
                <FaUserCheck className="h-7 w-7 text-blue-500" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {error && <div className="text-white">Can't find this user</div>}
    </div>
  );
}
