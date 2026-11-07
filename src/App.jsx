import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
// Sections temporarily disabled while the hero is being redesigned.
// import SelectedWorks from "./components/SelectedWorks";
// import Journal from "./components/Journal";
// import Explorations from "./components/Explorations";
// import Stats from "./components/Stats";
// import Contact from "./components/Contact";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* Sections temporarily disabled while the hero is being redesigned.
        <SelectedWorks />
        <Journal />
        <Explorations />
        <Stats />
        <Contact />
        */}
      </main>
    </>
  );
}
