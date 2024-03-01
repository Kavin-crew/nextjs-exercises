import connectDB from "@/config/database";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";

// GET /api/properties/user/userId
export const GET = async (request, { params }) => {
  try {
    await connectDB();
    const userId = params.userId;

    if (!userId) return new Response("UserId is required", { status: 400 });

    const properties = await Property.find({ owner: userId });
    return new Response(JSON.stringify(properties), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Someting went wrong", { status: 500 });
  }
};

// DELETE /api/properties/user/userId
export const DELETE = async (request, { params }) => {
  try {
    const propertyId = params.id;

    const sessionUser = await getSessionUser();

    // check for session
    if (!sessionUser || !sessionUser.userId)
      return new Response("UserId is required", { status: 401 });

    const { userId } = sessionUser;

    await connectDB();

    const property = await Property.findById(propertyId);

    if (!property) return new Response("Property not found", { status: 404 });

    // verify ownership
    if (property.owner.toString() !== userId)
      return new Response("Unauthorized", { status: 401 });

    await property.deleteOne();

    return new Response("Property deleted", { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Someting went wrong", { status: 500 });
  }
};
