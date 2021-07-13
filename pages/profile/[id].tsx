import Head from "next/head";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, MouseEvent, FormEvent } from "react";
import axios from "axios";
import { IoMdArrowBack } from "react-icons/io";
import useSWR from "swr";

export default function MyProfile(props: { id: string }) {
  const server_url = process.env.NEXT_PUBLIC_SERVER_URL;
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);
  const { data, error } = useSWR(
    `${server_url}/api/users/${props.id}`,
    fetcher
  );

  return (
    <div className="w-2/3 pt-8 mx-auto">
      <Head>
        <title>Profile</title>
      </Head>
      {data && !error ? (
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
                src={data.image}
                width={160}
                height={160}
                objectFit="contain"
                className="rounded-full"
              />
            </div>
            <div className="mt-8">
              <p className="text-white text-2xl">{data.name}</p>
            </div>
          </div>

          <div></div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {error && <div>Can't find this user</div>}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { id: context.params?.id },
  };
};
