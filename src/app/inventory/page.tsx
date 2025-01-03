import Header from "../components/shared/Header"
import InventoryPageComponent from "./inventoryPage";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main>
        <InventoryPageComponent />
      </main>
    </>
  );
}
