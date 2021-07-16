import Head from "next/head";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, MouseEvent, FormEvent } from "react";
import axios from "axios";
import { IoMdArrowBack } from "react-icons/io";
import useSWR from "swr";
import { IUserProfile } from "../../interfaces/UserInterface";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [session, loadingSession] = useSession();
  const [id, setId] = useState("");
  const [userProfile, setUserProfile] = useState<IUserProfile>({
    username: "",
    img_url: `${process.env.NEXT_PUBLIC_USER_IMG}`,
    email: "",
    user_id: "",
    img_name: "",
    friend_requests: [],
    friends: [],
  });
  const [inputUsername, setInputUsername] = useState("");
  const [image, setImage] = useState<File>();
  const [notification, setNotification] = useState("");
  const [saveBtnText, setSaveBtnText] = useState("Save");
  const router = useRouter();
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetcher = async (url: string, id: string) => {
    if (!id) return;
    const response = await axios.get(`${url}/${id}`);
    return response.data;
  };

  const { data, error } = useSWR([`${server_url}/api/users`, id], fetcher);

  const changeUsername = async (e: MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!inputUsername) return;
      if (inputUsername === userProfile.username) return;
      console.log(inputUsername);
      setSaveBtnText("Saving...");
      const response = await axios.post(
        `${server_url}/api/users/change-user-name`,
        {
          newUsername: inputUsername,
          user_id: userProfile.user_id,
        }
      );
      console.log(response.data);
      setUserProfile({
        ...userProfile,
        username: response.data.newUsername,
      });
      setSaveBtnText("Save");
    } catch (err) {
      console.log(err);
      setSaveBtnText("Save");
    }
  };

  const changeAvt = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!image) return;
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        try {
          setNotification("Uploading...");
          const res = await axios.post(`${server_url}/api/users/upload`, {
            data: reader.result,
            name: image.name,
            user_id: userProfile.user_id,
            img_name: userProfile.img_name,
          });
          setUserProfile({
            ...userProfile,
            img_url: res.data.url,
          });
          setImage(undefined);
          setNotification("");
        } catch (err) {
          console.log(err);
          setNotification("Can't upload this image");
        }
      };
    } catch (err) {
      console.log(err, "Error client");
    }
  };

  const onChangeUsername = (e: FormEvent<HTMLInputElement>) => {
    setInputUsername(e.currentTarget.value);
  };

  const onChangeFile = (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      setImage(e.currentTarget.files[0]);
      setNotification(e.currentTarget.files[0].name);
    }
  };

  useEffect(() => {
    if (!session && !loadingSession) {
      localStorage.removeItem("session.user");
      router.push("/");
    }
  }, [session, loadingSession]);

  useEffect(() => {
    if (localStorage.getItem("session.user")) {
      setId(localStorage.getItem("session.user") || "");
    } else {
      localStorage.removeItem("session.user");
      signOut({ redirect: false, callbackUrl: "/" });
    }
  }, []);

  useEffect(() => {
    if (error) {
      localStorage.removeItem("session.user");
      router.push("/");
    }
    if (data) {
      setUserProfile({
        ...userProfile,
        user_id: data._id,
        username: data.name,
        email: data.email,
        img_url: data.image,
        img_name: data.image_name,
      });
      setInputUsername(data.name);
      setLoading(false);
    }
  }, [data, error]);

  return (
    <div className="w-2/3 pt-8 mx-auto">
      <Head>
        <title>Profile</title>
      </Head>
      {!loading ? (
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
                src={userProfile.img_url}
                width={160}
                height={160}
                objectFit="contain"
                className="rounded-full"
              />
            </div>
            <div className="mt-8">
              <form onSubmit={changeUsername} className="flex items-center">
                <input
                  type="text"
                  value={inputUsername}
                  onChange={onChangeUsername}
                  className="text-white text-2xl bg-white bg-opacity-0 outline-none"
                />
                {userProfile.username !== inputUsername && (
                  <button
                    type="submit"
                    className="ml-4 text-white bg-red-500 px-2 py-1 rounded"
                  >
                    {saveBtnText}
                  </button>
                )}
              </form>
              <p className="text-gray-400">{userProfile.email}</p>
            </div>
          </div>

          <div>
            <form onSubmit={changeAvt}>
              <label
                htmlFor="file"
                className="p-2 bg-green-500 text-white rounded cursor-pointer"
              >
                Change avatar
              </label>
              <input
                className="text-white hidden"
                id="file"
                type="file"
                accept="image/*"
                onChange={onChangeFile}
              />
              {notification && (
                <p className="text-white mt-3">{notification}</p>
              )}
              <button
                type="submit"
                className={`${
                  image ? "bg-red-500" : "bg-gray-500 cursor-default"
                } text-white px-2 py-1 rounded block mt-3`}
              >
                Upload
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
