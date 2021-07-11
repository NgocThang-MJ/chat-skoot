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
  const [image, setImage] = useState<File>();
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

  const onSubmit = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!image) return;
      console.log(image);
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        const res = await axios.post(`${server_url}/api/upload`, {
          data: reader.result,
          name: image.name,
          userId: session?.userId,
        });
        console.log(res.data);
      };
    } catch (err) {
      console.log(err, "Error client");
    }
  };

  useEffect(() => {
    console.log(session);
    if (!session && !loading) {
      router.push("/");
    }
  }, [session, loading]);

  const onChangeFile = (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      setImage(e.currentTarget.files[0]);
    }
  };

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
                src={session.user?.image!}
                width={160}
                height={160}
                objectFit="contain"
                className="rounded-full"
              />
            </div>
            <div className="mt-10">
              <p className="text-white text-2xl mb-1">{session.user?.name}</p>
              <p className="text-gray-400">{session.user?.email}</p>
            </div>
          </div>

          <div>
            <form onSubmit={onSubmit}>
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
              <button
                type="submit"
                className="bg-pink-500 px-2 py-1 rounded block mt-5"
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
