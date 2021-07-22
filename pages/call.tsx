import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Peer from "simple-peer";
import { GrClose } from "react-icons/gr";
import { FaPhone } from "react-icons/fa";

import socket from "../util/socket";

export default function Call() {
  const router = useRouter();
  const { room_id, socket_id, answer, video, audio } = router.query;
  const [talkerName, setTalkerName] = useState("");
  const [talkerImg, setTalkerImg] = useState("");
  const [calling, setCalling] = useState(false);
  const [inCall, setInCall] = useState(false);
  const friendsVideoRef = useRef<HTMLVideoElement>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>();

  const offCall = () => {
    socket.emit("off call", room_id);
    setCalling(false);
    setInCall(false);
  };

  const endCall = () => {
    socket.emit("end call", room_id);
  };

  const clearStorage = () => {
    localStorage.removeItem("data");
    localStorage.removeItem("name_caller");
    localStorage.removeItem("img_caller");
    localStorage.removeItem("name_talker");
    localStorage.removeItem("img_talker");
  };

  useEffect(() => {
    const name_talker = localStorage.getItem("name_talker");
    const image_talker = localStorage.getItem("img_talker");
    if (!name_talker || !image_talker) {
      clearStorage();
      return window.close();
    }
    audioRef.current = new Audio("/RenaiCirculation.mp3");
    setTalkerName(name_talker);
    setTalkerImg(image_talker);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    socket.connect();
    socket.on("connect", () => {
      socket.emit("join conversation", room_id);
    });
    const name_caller = localStorage.getItem("name_caller");
    const image_caller = localStorage.getItem("img_caller");
    navigator.mediaDevices
      .getUserMedia({
        video: video === "true",
        audio: audio === "true",
      })
      .then((stream) => {
        const tracks = stream.getTracks();

        socket.on("end call", () => {
          setInCall(false);
          tracks.forEach((track) => track.stop());
          clearStorage();
          window.close();
        });

        if (answer) {
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
          });

          const remote_data = localStorage.getItem("data");
          if (!remote_data) {
            alert("Can't establish call");
            return window.close();
          }

          peer.on("signal", (data) => {
            socket.emit("answer", {
              signal_data: data,
              room_id,
            });
          });

          peer.on("stream", (remoteStream) => {
            setInCall(true);
            myVideoRef.current!.srcObject = stream;
            friendsVideoRef.current!.srcObject = remoteStream;
          });

          peer.signal(remote_data);
        } else {
          audioRef.current && audioRef.current.play();
          setCalling(true);
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
          });

          peer.on("signal", (data) => {
            socket.emit("call", {
              signal_data: data,
              room_id,
              name_caller,
              image_caller,
              socket_id,
              is_video: video === "true",
            });
          });

          peer.on("stream", (remoteStream) => {
            audioRef.current && audioRef.current.pause();
            myVideoRef.current!.srcObject = stream;
            friendsVideoRef.current!.srcObject = remoteStream;
          });

          socket.on("answer", (signal) => {
            peer.signal(signal);
            setInCall(true);
            setCalling(false);
          });

          socket.on("off call", () => {
            tracks.forEach((track) => track.stop());
            clearStorage();
            window.close();
          });
          socket.on("reject call", () => {
            tracks.forEach((track) => track.stop());
            setCalling(false);
            setInCall(false);
            clearStorage();
            window.close();
          });
        }
      })
      .catch((err) => {
        // clearStorage();
        console.log(err);
        alert("Can't use video and/or audio");
        endCall();
        window.close();
      });
  }, [router.isReady]);

  return (
    <div className="bg-gray-700">
      {calling && (
        <div className="w-screen h-screen">
          <div className="mx-auto flex flex-col items-center justify-center h-2/3 text-white">
            <Image
              src={talkerImg || `${process.env.NEXT_PUBLIC_USER_IMG}`}
              width={180}
              height={180}
              alt="Avatar"
              className="rounded-full"
            />
            <p className="text-xl">{talkerName}</p>
            <p>Calling...</p>
            <div className="mt-4">
              <div
                onClick={offCall}
                className="rounded-full bg-gray-400 p-3 cursor-pointer hover:bg-gray-300"
              >
                <GrClose className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {inCall && (
        <div className="w-screen h-screen z-40">
          <div className="mx-auto h-full flex items-center justify-center">
            <div className="flex flex-col items-center w-full h-full">
              <div className="flex items-center justify-center w-full h-5/6">
                <div className="mx-2 w-2/5 h-5/6">
                  <video autoPlay muted playsInline ref={myVideoRef} />
                </div>
                <div className="mx-2 w-2/5 h-5/6">
                  <video autoPlay playsInline ref={friendsVideoRef} />
                </div>
              </div>

              <div
                onClick={endCall}
                className="rounded-full bg-red-500 p-3 cursor-pointer hover:bg-red-600 mt-3 inline-block"
              >
                <FaPhone className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
