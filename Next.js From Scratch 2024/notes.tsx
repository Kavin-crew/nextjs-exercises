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
