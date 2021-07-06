import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { signOut, useSession } from "next-auth/client";

import { connectToDatabase } from "../util/mongodb.js";

export default function Home() {
  const router = useRouter();
  const [session, loading] = useSession();
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const socket = io(`${server_url}`);

  socket.on("connect", () => {
    console.log(socket.id, "id socket");
  });

  useEffect(() => {
    console.log(session);
    if (!(session || loading)) {
      router.push("/");
    }
  }, [session, loading]);

  if (!session || loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Head>
        <title>Chat Skoot</title>
      </Head>
      {session ? (
        <div className="flex mx-6">
          <div className="w-64 flex-shrink-0">
            <p className="text-xl">Message</p>
          </div>
          <div className="bg-red-500 flex-grow">Chat</div>
          <div className="flex justify-between items-center flex-shrink-0 w-72 max-w">
            <div className="flex items-center">
              <div className="mx-2 h-8">
                <Image
                  src={session.user?.image!}
                  width={32}
                  height={32}
                  alt="Avatar"
                  className="rounded-full"
                />
              </div>
              <p>{session.user?.name}</p>
            </div>
            <button
              className="text-white bg-blue-500 p-2"
              onClick={() => {
                signOut({ redirect: false });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// export async function getStaticProps() {
//   const { db } = await connectToDatabase();
//   const movies = await db.collection("movies").find({}).limit(20).toArray();
//   console.log("db connected");

//   return {
//     props: { movies: JSON.parse(JSON.stringify(movies)) },
//   };
// }
