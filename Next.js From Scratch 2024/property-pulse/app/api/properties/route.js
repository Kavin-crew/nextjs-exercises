import connectDB from "@/config/database";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";
import cloudinary from "@/config/cloudinary";

// GET /api/properties
export const GET = async (request) => {
  try {
    await connectDB();
    const properties = await Property.find({});
    return new Response(JSON.stringify(properties), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Someting went wrong", { status: 500 });
  }
};

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
      type: formData.get("type"),
      name: formData.get("name"),
      description: formData.get("description"),
      location: {
        street: formData.get("location.street"),
        city: formData.get("location.city"),
        state: formData.get("location.state"),
        zipcode: formData.get("location.zipcode"),
      },
      beds: formData.get("beds"),
      baths: formData.get("baths"),
      square_feet: formData.get("square_feet"),
      amenities,
      rates: {
        nightly: formData.get("rates.nightly"),
        weekly: formData.get("rates.weekly"),
        monthly: formData.get("rates.monthly"),
      },
      seller_info: {
        name: formData.get("seller_info.name"),
        email: formData.get("seller_info.email"),
        phone: formData.get("seller_info.phone"),
      },
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
