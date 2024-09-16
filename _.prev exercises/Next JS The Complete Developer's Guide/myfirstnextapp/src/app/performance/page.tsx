import Hero from "@/components/hero";
import performanceImg from "/public/performance.jpg";

export default function PerformancePage() {
  return (
    <Hero
      title="Performance page"
      imgData={performanceImg}
      imgAlt="alt images"
    />
  );
}
