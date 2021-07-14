import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { BiSearch } from "react-icons/bi";
import axios from "axios";

import { IUserProfile, IFriend } from "../../interfaces/UserInterface";

export default function Friend(props: { userProfile: IUserProfile }) {
  const userProfile = props.userProfile;
  const [friends, setFriends] = useState<IFriend[]>([]);
  const [input, setInput] = useState("");
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetchFriends = async () => {
    const response = await axios.post(`${server_url}/api/users`, {
      ids: userProfile.friends,
    });
    return response.data;
  };

  useEffect(() => {
    if (!userProfile.friends.length) return;
    fetchFriends().then((friends) => {
      setFriends(friends);
    });
  }, [userProfile]);

  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-600 pr-5">
      <div className="">
        <p className="text-xl">Friends</p>
        <form
          className="bg-gray-600 rounded mt-3 items-center hidden md:flex"
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
        {friends.length > 0 &&
          friends.map((friend) => (
            <div
              className="flex items-center rounded-md hover:bg-gray-700 p-2 cursor-pointer mb-2"
              key={friend._id}
            >
              <Image
                src={friend.image || `${process.env.NEXT_PUBLIC_USER_IMG}`}
                width={40}
                height={40}
                className="rounded-full"
              />
              <p className="ml-2 relative bottom-2">{friend.name}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
