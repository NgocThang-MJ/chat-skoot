import Head from "next/head";
import { useRouter } from "next/router";
import { getSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, MouseEvent, FormEvent } from "react";
import axios from "axios";
import { IoMdArrowBack } from "react-icons/io";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    username: "",
    imgUrl: `${process.env.NEXT_PUBLIC_USER_IMG}`,
    userId: "",
  });
  const router = useRouter();
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    console.log("re-run");
    const getProfile = async () => {
      const profile = await getSession();
      return profile;
    };
    getProfile()
      .then((profile) => {
        if (!profile) return router.push("/");
        setLoading(false);
        setUserProfile({
          ...userProfile,
          username: profile?.user?.name!,
          userId: profile?.userId as string,
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
              <p className="text-white text-2xl">{userProfile.username}</p>
            </div>
          </div>

          <div></div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
