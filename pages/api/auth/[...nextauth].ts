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
    async session(session, token) {
      const user_id = JSON.parse(JSON.stringify(token)).id;
      const { db } = await connectToDatabase();
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(user_id) });
      session.img_name = user.image_name;
      session.user_id = user_id;
      session.friend_requests = user.friend_requests || [];
      session.friends = user.friends || [];
      return session;
    },
  },
  database: process.env.DB_URL,
});
