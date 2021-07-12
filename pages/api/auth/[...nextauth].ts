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
  // session: {
  //   jwt: true,
  //   maxAge: 60 * 60,
  // },
  callbacks: {
    async session(session, token) {
      // console.log(session);
      // console.log(user);
      // console.log(JSON.parse(JSON.stringify(user)));
      const userId = JSON.parse(JSON.stringify(token)).id;
      const { db } = await connectToDatabase();
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) });
      session.img_name = user.image_name;
      session.userId = userId;
      return session;
    },
    // async jwt(token, user, account, profile, isNewUser) {
    //   console.log(token, "token");
    //   console.log(user, "user");
    //   console.log(account, "acc");
    //   console.log(profile, "profile");
    //   console.log(isNewUser, "is");
    //   // token.user = user;
    //   // token.profile = profile;
    //   // token.abc = "abc";
    //   return Promise.resolve(token);
    // },
    //   async signIn(user, account, profile) {
    //     console.log(user, "user");
    //     console.log(account, "account");
    //     console.log(profile, "profile");
    //     // const { db } = await connectToDatabase();
    //     return true;
    //   },
  },
  database: process.env.DB_URL,
});
