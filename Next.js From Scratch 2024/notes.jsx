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

////////////////////
// Using profile image
////////////////////
const profileImage = session?.user?.image;

// to fix the error of the image, need to configure next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;

////////////////////
// Protect routes
////////////////////
// create a middleware.js file in root folder, add the routes you want to protect
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/properties/add", "/profile", "/properties/saved", "/message"],
};

////////////////////
// POST Request
////////////////////
<form
  action="/api/properties"
  method="POST"
  encType="multipart/form-data"
></form>;

// in our api route
import { getServerSession } from "next-auth/next"; //to get the session
import { authOptions } from "@/utils/authOptions"; //to get the auth option of the user

// POST /api/properties
export const POST = async (request) => {
  try {
    await connectDB();

    //custom hook
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId)
      return new Response("Unathorized, User ID is required", { status: 401 });

    const { userId } = sessionUser;

    const formData = await request.formData();

    // access all values from amenities and images
    const amenities = formData.getAll("amenities");
    // since images is required, we need to have an image so we filter if name is not empty
    const images = formData
      .getAll("images")
      .filter((image) => image.name !== "");

    // create propertyData object for database
    const propertyData = {
      name: formData.get("name"),
      description: formData.get("description"),
      location: {
        street: formData.get("location.street"),
        city: formData.get("location.city"),
      },
      beds: formData.get("beds"),
      baths: formData.get("baths"),
      square_feet: formData.get("square_feet"),
      amenities,
      owner: userId,
    };

    // upload image to cloudinary
    const uploadImagePromises = [];

    for (const image of images) {
      // to convert image to our code
      const imageBuffer = await image.arrayBuffer();
      const imageArray = Array.from(new Uint8Array(imageBuffer));
      const imageData = Buffer.from(imageArray);

      //convert imageData to base64
      const imageBase64 = imageData.toString("base64");

      //make request to upload to cloudinary
      const result = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageBase64}`,
        {
          folder: "propertypulse",
        }
      );

      uploadImagePromises.push(result.secure_url);

      // wait for all images to upload
      const uploadedImages = await Promise.all(uploadImagePromises);

      // Add uploaded images to our propertyData object
      propertyData.images = uploadedImages;
    }

    // adding all data to Property model
    const newProperty = new Property(propertyData);
    await newProperty.save();

    return Response.redirect(
      `${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`
    );

    // return new Response(JSON.stringify({ message: "success" }), {
    //   status: 200,
    // });
  } catch (error) {
    return new Response("Failed to add property", { status: 500 });
  }
};

////////////////////
// Cloudinary
////////////////////
// 1. go to settings > update your desired Product environment cloud name
// 2. go to access keys > copy the api key and api secret and put it to the .env file
CLOUDINARY_CLOUD_NAME=kavin-cr
CLOUDINARY_API_KEY=33156356
CLOUDINARY_API_SECRET=XKGg6sZz6S1q

// 3. install cloudinary
// npm i cloudinary
// 4. go back to cloudinary > nagivate to Media library > create a new folder
// 5. create a config in our file. go to config folder > create cloudinary.js file
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

////////////// to use the cloudinary
import cloudinary from "@/config/cloudinary";

// upload image to cloudinary
const uploadImagePromises = [];

for (const image of images) {
    // to convert image to our code
    const imageBuffer = await image.arrayBuffer();
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    const imageData = Buffer.from(imageArray);

    //convert imageData to base64
    const imageBase64 = imageData.toString("base64");

    //make request to upload to cloudinary
    const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${imageBase64}`,
    {
        folder: "propertypulse",
    }
);

////////////////////
// Add Cloudinary to our remote patterns
////////////////////
// 1. go to next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },
};

////////////////////
// DELETE Request
//////////////////
// we need to get the current session user so only session user can delete its own listing
import { getSessionUser } from "@/utils/getSessionUser";

// DELETE /api/properties/user/userId
export const DELETE = async (request, { params }) => {
  try {
    const propertyId = params.id;

    const sessionUser = await getSessionUser();

    // Check for session
    if (!sessionUser || !sessionUser.userId) {
      return new Response("User ID is required", { status: 401 });
    }

    const { userId } = sessionUser;

    await connectDB();

    const property = await Property.findById(propertyId);

    if (!property) return new Response("Property Not Found", { status: 404 });

    // Verify ownership
    if (property.owner.toString() !== userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // to delete the images in cloudinary
    // extract public id's from image url in DB
    const publicIds = property.images.map((imageUrl) => {
      const parts = imageUrl.split("/");
      return parts.at(-1).split(".").at(0);
    });

    // Delete images from Cloudinary
    if (publicIds.length > 0) {
      for (let publicId of publicIds) {
        await cloudinary.uploader.destroy("propertypulse/" + publicId);
      }
    }

    // Proceed with property deletion
    await property.deleteOne();

    return new Response("Property Deleted", {
      status: 200,
    });
  } catch (error) {
    return new Response("Something Went Wrong", { status: 500 });
  }
};

////////////////////
// React Share
////////////////////
// npm i react-share
import {
  FacebookShareButton,
  FacebookIcon,
} from "react-share";

<FacebookShareButton
  url={shareUrl}
  quote={property.name}
  hashtag={`#${property.type.replace(/\s/g, "")}ForRent`}
>
  <FacebookIcon size={40} round={true} />
</FacebookShareButton>