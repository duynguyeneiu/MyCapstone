import HomeContent from "./home/HomeContent";
import CategoryBar from "./CategoryBar";

export default function HomeGate() {
  // All users (including admin/staff) → show the shopping homepage
  return (
    <div className="aqua-page">
      <CategoryBar />
      <HomeContent />
    </div>
  );
}
