import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import { BiSearch } from "react-icons/bi";
import axios from "axios";
import useSWR from "swr";
import TimeAgo from "timeago-react";

import socket from "../../util/socket";

import {
  IUserProfile,
  IRoom,
  RoomMember,
} from "../../interfaces/UserInterface";

export default function Friend(props: {
  userProfile: IUserProfile;
  setConversation: Function;
  setRoom: Function;
  setRoomSocketId: Function;
}) {
  const userProfile = props.userProfile;
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [input, setInput] = useState("");
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetchRooms = async (user_id: string) => {
    if (!user_id) return;
    const response = await axios.get(`${server_url}/api/rooms/${user_id}`);
    const data: IRoom[] = response.data;
    return data;
  };

  const { data, error } = useSWR(userProfile.user_id, fetchRooms);

  const joinRoom = async (room: IRoom, talker: RoomMember) => {
    socket.emit("join room", room.room_socket_id);
    props.setRoom(room);
    props.setRoomSocketId(room.room_socket_id);
    props.setConversation({
      id: talker.id,
      name: talker.name,
      image: talker.image,
    });
  };

  useEffect(() => {
    socket.on("new message", (updatedRoom: IRoom) => {
      if (!rooms[0]) return;
      const updatedRooms = rooms.filter((room) => room._id !== updatedRoom._id);
      setRooms([updatedRoom, ...updatedRooms]);
    });
  }, [rooms]);

  useEffect(() => {
    if (data) {
      const ids = data.map((room) => room._id);
      socket.emit("join room", ids);
      setRooms(data);
    }
    if (error) {
      console.log(error);
    }
  }, [data, error]);
  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-600 pr-5">
      <div className="">
        <p className="text-xl">Friends</p>
        <form
          className="flex bg-gray-600 rounded mt-3 items-center"
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
        {rooms.length > 0 &&
          rooms.map((room) => {
            const talker: RoomMember = room.members.filter(
              (member) => member.id !== userProfile.user_id
            )[0];
            return (
              <div
                className="flex items-center rounded-md hover:bg-gray-700 p-2 cursor-pointer mb-2 transition"
                onClick={() => joinRoom(room, talker)}
                key={room._id}
              >
                <Image
                  src={talker.image || `${process.env.NEXT_PUBLIC_USER_IMG}`}
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <div className="ml-2 whitespace-nowrap relative top-1">
                  <p className="overflow-ellipsis overflow-hidden w-40">
                    {talker.name}
                  </p>
                  <div>
                    <span className="text-gray-500 overflow-ellipsis max-w-10 overflow-hidden inline-block">
                      {room.last_msg}
                    </span>
                    <span className="text-gray-500 ml-2 overflow-ellipsis inline-block overflow-hidden">
                      &middot;{" "}
                      <TimeAgo datetime={room.last_date_msg} live={false} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
