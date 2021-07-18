import { ObjectId } from "mongodb";

export type RoomMember = {
  id: string;
  name: string;
  image: string;
};

export interface IUserProfile {
  user_id: string;
  email: string;
  username: string;
  img_url: string;
  img_name: string;
  friend_requests: string[];
  friends: string[];
}

export interface IRequestUser {
  _id: string;
  name: string;
  image: string;
}

export interface ISearchedUser {
  _id: string;
  name: string;
  image: string;
}

export interface IAnotherProfile {
  user_id: string;
  name: string;
  img_url: string;
  friendRequests: string[];
}

export interface IFriend {
  name: string;
  _id: string;
  image: string;
}

export interface IRoom {
  _id: string;
  is_auto_create: boolean;
  memberIds: Array<ObjectId>;
  members: RoomMember[];
  last_msg: string;
  last_date_msg: Date;
}

export interface IMessage {
  _id: string;
  room_id: string;
  content: string;
  sender_id: string;
  createdAt: Date;
}
