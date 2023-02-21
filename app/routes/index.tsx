import NavBar from "~/components/NavBar"
import HeroSection from "~/components/HeroSection"

export default function Index() {
  return (
    <div className="bg-gray-800">
      <NavBar />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection />
      </div>
    </div>
  );
}
