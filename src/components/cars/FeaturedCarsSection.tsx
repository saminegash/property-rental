import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarListingCard } from "./CarListingCard";

interface FeaturedCarListing {
  id: string;
  title: string;
  location: string | null;
  vehicle_details: {
    make: string;
    model: string;
    year: number;
  }[];
  rental_terms: {
    daily_price: number | null;
    daily_driver_fee: number | null;
    security_deposit_amount: number;
    delivery_fee: number | null;
    available_with_driver: boolean;
    available_without_driver: boolean;
    delivery_available: boolean;
  }[];
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

const fallbackCars: FeaturedCarListing[] = [
  {
    id: "car-fb-1",
    title: "Toyota Corolla 2018",
    location: "Kazanchis, Addis Ababa",
    vehicle_details: [{ make: "Toyota", model: "Corolla", year: 2018 }],
    rental_terms: [{
      daily_price: 3000, daily_driver_fee: 1200, security_deposit_amount: 12000,
      delivery_fee: 500, available_with_driver: true, available_without_driver: true, delivery_available: true,
    }],
    listing_images: [{ image_url: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=800&q=80", is_primary: true }],
  },
  {
    id: "car-fb-2",
    title: "Hyundai Tucson 2021",
    location: "Bole, Addis Ababa",
    vehicle_details: [{ make: "Hyundai", model: "Tucson", year: 2021 }],
    rental_terms: [{
      daily_price: 4500, daily_driver_fee: 1500, security_deposit_amount: 20000,
      delivery_fee: 500, available_with_driver: true, available_without_driver: false, delivery_available: true,
    }],
    listing_images: [{ image_url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80", is_primary: true }],
  },
  {
    id: "car-fb-3",
    title: "Toyota Land Cruiser 2016",
    location: "CMC, Addis Ababa",
    vehicle_details: [{ make: "Toyota", model: "Land Cruiser", year: 2016 }],
    rental_terms: [{
      daily_price: 7500, daily_driver_fee: 2000, security_deposit_amount: 40000,
      delivery_fee: 800, available_with_driver: true, available_without_driver: true, delivery_available: true,
    }],
    listing_images: [{ image_url: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80", is_primary: true }],
  },
  {
    id: "car-fb-4",
    title: "Kia Rio 2017",
    location: "Megenagna, Addis Ababa",
    vehicle_details: [{ make: "Kia", model: "Rio", year: 2017 }],
    rental_terms: [{
      daily_price: 2200, daily_driver_fee: null, security_deposit_amount: 8000,
      delivery_fee: null, available_with_driver: false, available_without_driver: true, delivery_available: false,
    }],
    listing_images: [{ image_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80", is_primary: true }],
  },
];

export async function FeaturedCarsSection() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, location,
      vehicle_details ( make, model, year ),
      rental_terms (
        daily_price, daily_driver_fee, security_deposit_amount,
        delivery_fee, available_with_driver, available_without_driver, delivery_available
      ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "vehicle")
    .eq("listing_type", "rent")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);

  const cars: FeaturedCarListing[] =
    listings && listings.length > 0
      ? (listings as unknown as FeaturedCarListing[])
      : fallbackCars;

  return (
    <section className="featured-cars" id="featured-cars">
      <div className="featured-cars__inner">
        {/* Header */}
        <div className="featured-cars__header">
          <div>
            <h2 className="featured-cars__title">Featured Cars</h2>
            <p className="featured-cars__subtitle">
              Top rated and most trusted cars, ready for you.
            </p>
          </div>
          <Link href="/cars" className="featured-cars__view-all" id="featured-cars-view-all">
            View all cars →
          </Link>
        </div>

        {/* Cards */}
        <div className="featured-cars__grid">
          {cars.map((car) => {
            const rt = car.rental_terms?.[0];
            const coverImage =
              car.listing_images?.find((img) => img.is_primary)?.image_url ||
              car.listing_images?.[0]?.image_url ||
              "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80";
            const isFallback = car.id.startsWith("car-fb-");
            const href = isFallback ? "/cars" : `/cars/${car.id}`;

            return (
              <CarListingCard
                key={car.id}
                id={car.id}
                title={car.title}
                location={car.location || "Addis Ababa"}
                image={coverImage}
                dailyPrice={rt?.daily_price ?? null}
                driverFee={rt?.daily_driver_fee ?? 0}
                securityDeposit={rt?.security_deposit_amount ?? 0}
                deliveryAvailable={rt?.delivery_available ?? false}
                withDriver={rt?.available_with_driver ?? false}
                withoutDriver={rt?.available_without_driver ?? false}
                href={href}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
