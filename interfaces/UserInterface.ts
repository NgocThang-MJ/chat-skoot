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
