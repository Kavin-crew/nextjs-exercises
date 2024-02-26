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

// import mongoose from "mongoose";

// let connected = false;

// const connectDB = async () => {
//   mongoose.set("strictQuery", true);

//   // if database is already connected, don't connect again
//   if (connected) {
//     console.log("MongoDB is already connected...");
//     return;
//   }

//   // connect to MongoDB
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     connected = true;
//     console.log("MongoDB connected...");
//   } catch (error) {
//     console.log(error);
//   }
// };

// export default connectDB;
