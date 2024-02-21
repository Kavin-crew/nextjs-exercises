import Image from "next/image";
import performanceImg from "/public/performance.jpg";

export default function PerformancePage() {
  return (
    <div>
      Performance Page!
      <Image src={performanceImg} alt="some image" />
    </div>
  );
}
