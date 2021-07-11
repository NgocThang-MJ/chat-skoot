import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/client";
import Image from "next/image";
import { useEffect, MouseEvent } from "react";
import {
  Cloudinary,
  CloudinaryFile,
  CloudinaryImage,
  CloudinaryBaseSDK,
} from "@cloudinary/base";

export default function Profile() {
  const [session, loading] = useSession();
  const router = useRouter();
  const cld = new Cloudinary({
    cloud: {
      cloudName: "liquid-cloudinary",
    },
  });

  const onSubmit = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (!session && !loading) {
      router.push("/");
    }
  }, [session, loading]);

  return (
    <div className="w-2/3 pt-8 mx-auto">
      <Head>
        <title>Profile</title>
      </Head>
      {session ? (
        <div>
          <div className="flex mb-5">
            <div className="mr-10">
              <Image
                src={session.user?.image!}
                width={160}
                height={160}
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
              <label htmlFor="file" className="p-2 bg-green-500 text-white">
                Select Image
              </label>
              <input
                className="text-white hidden"
                id="file"
                type="file"
                accept="image/*"
              />
            </form>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
