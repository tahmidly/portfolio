import Hero from "../components/Hero";
import SelectedWorks from "../components/SelectedWorks";
import Journal from "../components/Journal";
import Explorations from "../components/Explorations";
import TechStack from "../components/TechStack";
import Stats from "../components/Stats";
import Contact from "../components/Contact";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <SelectedWorks />
      <Journal />
      <Explorations />
      <TechStack />
      <Stats />
      <Contact />
    </main>
  );
}
