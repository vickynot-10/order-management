import ProductsList from "./products/ProductsList";
import AppHeader from "@/components/common/Header";
export default function HomePage() {
  return (
    <div className=" flex flex-col p-3">
      <AppHeader />
      <ProductsList />
    </div>
  );
}
