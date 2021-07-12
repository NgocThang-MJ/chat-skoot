import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, MouseEvent, FormEvent } from "react";
import axios from "axios";
import { IoMdArrowBack } from "react-icons/io";

export default function Profile() {
  const [session, loading] = useSession();
  const router = useRouter();
  const [imgUrl, setImgUrl] = useState(`${process.env.NEXT_PUBLIC_USER_IMG}`);
  const [image, setImage] = useState<File>();
  const [notification, setNotification] = useState("");
  const [username, setUsername] = useState("");
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

  const changeUsername = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;
    if (session?.user.name === username) return;
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
            userId: session?.userId,
            img_name: session?.img_name,
          });
          setImgUrl(res.data.url);
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
    setUsername(e.currentTarget.value);
    console.log(e.currentTarget.value);
  };

  const onChangeFile = (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      setImage(e.currentTarget.files[0]);
      setNotification(e.currentTarget.files[0].name);
    }
  };

  useEffect(() => {
    if (!session && !loading) {
      router.push("/");
    }
    if (session) {
      setImgUrl(session.user?.image!);
      setUsername(session.user?.name!);
    }
  }, [session, loading]);

  return (
    <div className="w-2/3 pt-8 mx-auto">
      <Head>
        <title>Profile</title>
      </Head>
      {session ? (
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
                src={imgUrl}
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
                  value={username}
                  onChange={onChangeUsername}
                  className="text-white text-2xl bg-white bg-opacity-0 outline-none"
                />
                {username !== session.user?.name && (
                  <button
                    type="submit"
                    className="ml-4 text-white bg-red-500 px-2 py-1 rounded"
                  >
                    Save
                  </button>
                )}
              </form>
              <p className="text-gray-400">{session.user?.email}</p>
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
