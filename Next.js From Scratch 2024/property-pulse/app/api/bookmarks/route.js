import connectDB from "@/config/database";
import User from "@/models/Users";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";

export const dynamic = "force-dynamic";

export const POST = async (request) => {
  try {
    await connectDB();

    const { propertId } = request.json();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId)
      return new Response("User ID is required", { status: 401 });

    const { userId } = sessionUser;

    // find user in database
    const user = await User.findOne({ _id: userId });

    // check if property is bookmarked
    let isBookmarked = user.bookmarks.includes(propertId);

    let message;

    if (isBookmarked) {
      // if already bookmarked, remove it
      user.bookmarks.pull(propertId);
      message = "Bookmark removed successfully";
      isBookmarked = false;
    } else {
      // if not bookmarked, add it
      user.bookmarks.push(propertId);
      message = "Bookmark added successfully";
      isBookmarked = true;
    }

    await user.save();

    return new Response(JSON.stringify({ message, isBookmarked }), {
      status: 500,
    });
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
};
