import { useState, FormEvent } from "react";
import Image from "next/image";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";

import { IUserProfile } from "../../interfaces/UserInterface";

export default function Chat(props: { userProfile: IUserProfile }) {
  const [text, setText] = useState<String>("");

  // Send message
  const onSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(text);
    setText("");
  };

  return (
    <div className="flex-grow border-r border-gray-600 relative">
      <div className="flex justify-between items-center border-b border-gray-700 pb-1">
        <div className="flex items-center ml-2">
          <Image
            src={
              props.userProfile.img_url || `${process.env.NEXT_PUBLIC_USER_IMG}`
            }
            width={36}
            height={36}
            alt="Avatar"
            className="rounded-full"
          />
          <p className="ml-3">{props.userProfile.username}</p>
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
  );
}
