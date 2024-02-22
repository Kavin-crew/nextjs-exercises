////////////////////
// folder route
////////////////////
// file based router
// inside the app folder is an special folder where usually pages live
// if we want new page, we just put it inside of app folder>new folder>page.tsx

// instead of importing "../../../component/header", u may use "@/component/header" or basically @ = start from src folder
// for images, and other files u can use "public/img1.jpg"
// to deploy to vercel. type npx vercel and use the default settings

////////////////////
// Prisma
////////////////////
// npm i prisma
// npx prisma init --datasource-provider sqlite

// go to prisma folder>schema.prisma file
// we need to make a model for our data

// model Snippet{
//   id Int @id @default(autoincrement())
//   title String
//   code String
// }

// npx prisma migrate dev

/////////////////// to access our database for some operations
// 1. create prisma client to access our database
// create a db folder inside app folder, inside db folder create index.ts file
// import { PrismaClient } from "@prisma/client";
// export const db = new PrismaClient();

// 2. create a form
// 3. define a Server Action. a function is called once form is submitted
// 4. in Server Action, validate the users input then create a new snippet
// 5. redirect the user to homepage, where the snippets is listed
