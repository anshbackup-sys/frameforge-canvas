import Header from "./Header";
import Footer from "./Footer";
import { HomePageContent } from "./HomePageContent";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HomePageContent />
      <Footer />
    </div>
  );
};

export default HomePage;
