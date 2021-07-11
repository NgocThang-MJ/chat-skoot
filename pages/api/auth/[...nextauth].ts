import NextAuth from "next-auth";
import Providers from "next-auth/providers";

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
      session.userId = JSON.parse(JSON.stringify(token)).id;
      return session;
    },
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
