import connectDB from "@/config/database";
import User from "@/models/Users";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    // invoked successfull sign.in
    async signIn({ profile }) {
      // 1.connect to the database
      await connectDB();
      // 2.check if user exists
      const userExists = await User.findOne({ email: profile.email });
      // 3.if not, the add user to the database
      if (!userExists) {
        // truncate if name is too long into 20 characters
        const username = profile.name.slice(0, 20);

        await User.create({
          email: profile.email,
          username,
          image: profile.picture,
        });
      }
      // 4.return true to allow sign in
      return true;
    },
    // modifies the session object
    async session({ session }) {
      // 1. get user from database
      const user = await User.findOne({ email: session.user.email });
      // 2. assign the user id to the session
      session.user.id = user._id.toString();
      // 3. return session
      return session;
    },
  },
};
