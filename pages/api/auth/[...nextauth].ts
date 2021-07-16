import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../../../util/mongodb";

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Providers.Facebook({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Providers.Discord({
      clientId: process.env.DISCORD_ID,
      clientSecret: process.env.DISCORD_SECRET,
    }),
  ],
  callbacks: {
    // async signIn(user, account, profile) {
    //   // const userId = JSON.parse(JSON.stringify(user)).id;
    //   // localStorage.setItem("session.user", userId);
    //   console.log(localStorage);
    //   return true;
    // },
    async session(session, token) {
      const userId = JSON.parse(JSON.stringify(token)).id;
      const { db } = await connectToDatabase();
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) });
      session.img_name = user.image_name;
      session.userId = userId;
      session.friend_requests = user.friend_requests || [];
      session.friends = user.friends || [];
      return session;
    },
  },
  database: process.env.DB_URL,
});
