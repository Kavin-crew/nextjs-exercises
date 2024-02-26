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
