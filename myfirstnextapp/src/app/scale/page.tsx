import Image from "next/image";
import scaleImg from "/public/scale.jpg";

export default function ScalePage() {
  return (
    <div>
      Scale Page!
      <Image src={scaleImg} alt="some image" />
    </div>
  );
}
