import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Call() {
  const router = useRouter();

  useEffect(() => {}, []);

  return (
    <div>
      <div>Call page</div>
    </div>
  );
}
