// common usecase of next/navigation
// import {
//   useRouter,
//   useParams,
//   useSearchParams,
//   usePathname,
// } from "next/navigation";

// const router = useRouter();
// const searchParams = useSearchParams();
// const { id } = useParams();
// const name = searchParams.get("name");
// const pathname = usePathname();

////////////////////
// Connecting to mongodb
////////////////////
// 1. go to mongodb.com, create a database and cluster most of time default options
// 2. create and .env file on root folder. add the code below:
// NEXT_PUBLIC_DOMAIN = http://localhost:3000
// NEXT_PUBLIC_API_DOMAIN = http://localhost:3000/api
// MONGODB_URI = mongodb+srv://kavincrew:kavincrew@cluster0.fsnxo04.mongodb.net/propertypulse?retryWrites=true&w=majority&appName=Cluster0
// 3. Download the compass in the mongodb
// 4. connect using the url, and import json file for sample data
// 5. create a config folder in the root folder
// 6. create a database.js file inside config folder and add this code:

import mongoose from "mongoose";

let connected = false;

const connectDB = async () => {
  mongoose.set("strictQuery", true);

  // if database is already connected, don't connect again
  if (connected) {
    console.log("MongoDB is already connected...");
    return;
  }

  // connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
    console.log("MongoDB connected...");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;

// 7. create an api route, create a folder inside app folder, example properties folder
// 8. inside properties folder, create a route.jsx file
import connectDB from "@/config/database";

export const GET = async (request) => {
  try {
    await connectDB();
    return new Response(JSON.stringify({ message: "hello" }), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Someting went wrong", { status: 500 });
  }
};

////////////////////
// Creating model
////////////////////
// 1. create a models folder in the root folder
// 2. create Users.js
import { Schema, model, models } from "mongoose";

// we use GoogleAuth for this schema
const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Email is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
    },
    image: {
      type: String,
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Property" }],
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;

////////////////////
// Google auth
////////////////////
// 1. https://console.cloud.google.com/
// 2. create a project and select it once done loading
// 3. go to api and services>credentials>create credentials>OAuth client ID>configure consent screen>create > supply information, app logo and app domain can be configured during deployment > then save and continue > add or remove scopes, select the ../auth/user.info.email and ../auth/user.info.profile > click save and continue > add users for development
// 4. go back to credentials > create credentials>OAuth client ID> add Authorized JavaScript origins: http://localhost:3000 and for Authorized redirect URIs: http://localhost:3000/api/auth/callback/google> then press create
// 5. copy the client ID and secret and add it to our env file just create a variable for GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

////////////////////
// Logging in using Google auth
////////////////////
// npm i next-auth

// 1. in the app folder, create auth folder>inside auth folder> create [...nextauth] folder > then create route.js file
// 2. in the root folder > navigate to utils folder > create authOptions.js file
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

// 3. back to our [...nextauth] route.js file
import { authOptions } from "@/utils/authOptions";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

////////////////////
// Auth Provider
////////////////////
// 1. create a component AuthProvider.jsx
("use client");
import { SessionProvider } from "next-auth/react";

const AuthProvider = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;

// 2. wrap the layout into auto provider
const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
      <html lang="en">
        <body>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </AuthProvider>
  );
};

// 3. add 3 evironment variable for the auth, this will be updated once deployd
// to generate the NEXTAUTH_SECRET, run the command in terminal:
// openssl rand -base64 32

// NEXTAUTH_URL = http://localhost:3000
// NEXTAUTH_URL_INTERNAL = http://localhost:3000
// NEXTAUTH_SECRET=0oZf+6mbWwjdVi6Uf8eSjpguJ82eaTzJzHh+iPPVA58=

////////////////////
// Auth Signin button
////////////////////
import { useState, useEffect } from "react";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";

// in the component
// intialize the session
const { data: session } = useSession();

const [providers, setProviders] = useState(null);

useEffect(() => {
  const setAuthProviders = async () => {
    const res = await getProviders();
    setProviders(res);
  };

  setAuthProviders();
}, []);

/////////// in the button login where we click if we want to login
{
  providers &&
    Object.values(providers).map((provider, index) => (
      <button onClick={() => signIn(provider.id)} key={index}>
        Login or Register
      </button>
    ));
}
