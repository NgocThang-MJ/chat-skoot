export interface IUserProfile {
  userId: string;
  username: string;
  imgUrl: string;
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
  userId: string;
  name: string;
  imgUrl: string;
  friendRequests: string[];
}

export interface IFriend {
  name: string;
  _id: string;
  image: string;
}
