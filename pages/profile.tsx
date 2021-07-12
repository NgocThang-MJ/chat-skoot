import Head from "next/head";
import { useRouter } from "next/router";
import { getSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, MouseEvent, FormEvent } from "react";
import axios from "axios";
import { IoMdArrowBack } from "react-icons/io";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    username: "",
    imgUrl: `${process.env.NEXT_PUBLIC_USER_IMG}`,
    email: "",
    userId: "",
    imgName: "",
  });
  const [inputUsername, setInputUsername] = useState("");
  const [image, setImage] = useState<File>();
  const [notification, setNotification] = useState("");
  const [saveBtnText, setSaveBtnText] = useState("Save");
  const router = useRouter();
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

  const changeUsername = async (e: MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!inputUsername) return;
      setSaveBtnText("Saving...");
      const response = await axios.post(
        `${server_url}/api/users/change-user-name`,
        {
          newUsername: inputUsername,
          userId: userProfile.userId,
        }
      );
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
            userId: userProfile.userId,
            imgName: userProfile.imgName,
          });
          setUserProfile({
            ...userProfile,
            imgUrl: res.data.url,
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
    console.log("re-run");
    const getProfile = async () => {
      const profile = await getSession();
      return profile;
    };
    getProfile()
      .then((profile) => {
        setLoading(false);
        setInputUsername(profile?.user?.name!);
        setUserProfile({
          ...userProfile,
          username: profile?.user?.name!,
          email: profile?.user?.email || "",
          userId: profile?.userId as string,
          imgName: profile?.img_name as string,
          imgUrl: profile?.user?.image!,
        });
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
                src={userProfile.imgUrl}
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
