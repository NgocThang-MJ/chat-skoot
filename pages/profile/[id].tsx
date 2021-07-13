import Head from "next/head";
import { useRouter } from "next/router";

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <div>{id}</div>
    </div>
  );
}
