// ==================== Import Images ====================

// ===== Banner =====
import bottom_banner_image from "./banner1girl.jpg";   // desktop version
import bottom_banner_image_sm from "./banner1girl.jpg"; // mobile version

// ===== Feature Icons =====
import feature_icon_1 from "./icons/feature1.png";
import feature_icon_2 from "./icons/feature2.png";
import feature_icon_3 from "./icons/feature3.png";

// ===== Toys =====
import car1_image from "./toys/car1.jpg";
import car2_image from "./toys/car2.jpg";
import car3_image from "./toys/car3.jpg";
import car4_image from "./toys/car4.jpg";
import car5_image from "./toys/car5.jpg";
import car6_image from "./toys/car6.jpg";
import car7_image from "./toys/car7.jpg";
import helicopter1_image from "./toys/helicopter1.jpg";
import helicopter2_image from "./toys/helicopter2.jpg";
import minion_image from "./toys/minion.jpg";
import teddy_image from "./toys/teddy.jpg";

// ===== Kitchen Items =====
import aluminiumpots1_image from "./kitchen items/aluminiumpots1.jpg";
import aluminiumpots2_image from "./kitchen items/aluminiumpots2.jpg";
import aluminiumpots3_image from "./kitchen items/aluminiumpots3.jpg";
import mugs1_image from "./kitchen items/mugs1.jpg";
import mugs2_image from "./kitchen items/mugs2.jpg";
import mugs3_image from "./kitchen items/mugs3.jpg";
import mugs4_image from "./kitchen items/mugs4.jpg";
import porcelain1_image from "./kitchen items/porcelain1.jpg";
import porcelain2_image from "./kitchen items/porcelain2.jpg";
import porcelain3_image from "./kitchen items/porcelain3.jpg";
import porcelain4_image from "./kitchen items/porcelain4.jpg";
import school_items_image from "./categories/school-items.svg";
import home_items_image from "./categories/home-items.svg";
import electronics_image from "./categories/electronics.svg";
import beauty_personal_care_image from "./categories/beauty-personal-care.svg";
import sports_items_image from "./categories/sports-items.svg";
import baby_items_image from "./categories/baby-items.svg";
import pet_supplies_image from "./categories/pet-supplies.svg";
import clothing_fashion_image from "./categories/clothing-fashion.svg";

// ==================== Assets Export ====================
export const assets = {
  bottom_banner_image,
  bottom_banner_image_sm,
  feature_icon_1,
  feature_icon_2,
  feature_icon_3,
};

// ==================== Categories ====================
export const categories = [
  { text: "Car 1", path: "Toys", type: "Toys", image: car1_image, price: 850, oldPrice: 950 },
  { text: "Car 2", path: "Toys", type: "Toys", image: car2_image, price: 900, oldPrice: 1000 },
  { text: "Car 3", path: "Toys", type: "Toys", image: car3_image, price: 750, oldPrice: 850 },
  { text: "Car 4", path: "Toys", type: "Toys", image: car4_image, price: 800, oldPrice: 900 },
  { text: "Car 5", path: "Toys", type: "Toys", image: car5_image, price: 950, oldPrice: 1050 },
  { text: "Car 6", path: "Toys", type: "Toys", image: car6_image, price: 880, oldPrice: 980 },
  { text: "Car 7", path: "Toys", type: "Toys", image: car7_image, price: 920, oldPrice: 1020 },
  { text: "Helicopter 1", path: "Toys", type: "Toys", image: helicopter1_image, price: 900, oldPrice: 1000 },
  { text: "Helicopter 2", path: "Toys", type: "Toys", image: helicopter2_image, price: 950, oldPrice: 1050 },
  { text: "Minion", path: "Toys", type: "Toys", image: minion_image, price: 600, oldPrice: 700 },
  { text: "Teddy", path: "Toys", type: "Toys", image: teddy_image, price: 1200, oldPrice: 1300 },
  { text: "Aluminium Pots 1", path: "Kitchen", type: "Kitchen Items", image: aluminiumpots1_image, price: 1500, oldPrice: 1700 },
  { text: "Aluminium Pots 2", path: "Kitchen", type: "Kitchen Items", image: aluminiumpots2_image, price: 1600, oldPrice: 1800 },
  { text: "Aluminium Pots 3", path: "Kitchen", type: "Kitchen Items", image: aluminiumpots3_image, price: 1400, oldPrice: 1600 },
  { text: "Mugs 1", path: "Kitchen", type: "Kitchen Items", image: mugs1_image, price: 450, oldPrice: 500 },
  { text: "Mugs 2", path: "Kitchen", type: "Kitchen Items", image: mugs2_image, price: 480, oldPrice: 530 },
  { text: "Mugs 3", path: "Kitchen", type: "Kitchen Items", image: mugs3_image, price: 420, oldPrice: 470 },
  { text: "Mugs 4", path: "Kitchen", type: "Kitchen Items", image: mugs4_image, price: 500, oldPrice: 550 },
  { text: "Porcelain 1", path: "Kitchen", type: "Kitchen Items", image: porcelain1_image, price: 1400, oldPrice: 1500 },
  { text: "Porcelain 2", path: "Kitchen", type: "Kitchen Items", image: porcelain2_image, price: 1350, oldPrice: 1450 },
  { text: "Porcelain 3", path: "Kitchen", type: "Kitchen Items", image: porcelain3_image, price: 1450, oldPrice: 1550 },
  { text: "Porcelain 4", path: "Kitchen", type: "Kitchen Items", image: porcelain4_image, price: 1380, oldPrice: 1480 },
  { text: "School Bag", path: "school-items", type: "School Items", image: school_items_image, price: 2200, oldPrice: 2500 },
  { text: "Storage Box", path: "home-items", type: "Home Items", image: home_items_image, price: 1600, oldPrice: 1850 },
  { text: "Bluetooth Speaker", path: "electronics", type: "Electronics", image: electronics_image, price: 4200, oldPrice: 4700 },
  { text: "Face Wash", path: "beauty-personal-care", type: "Beauty & Personal Care", image: beauty_personal_care_image, price: 750, oldPrice: 900 },
  { text: "Football", path: "sports-items", type: "Sports items", image: sports_items_image, price: 1800, oldPrice: 2100 },
  { text: "Baby Lotion", path: "baby-items", type: "Baby Items", image: baby_items_image, price: 980, oldPrice: 1150 },
  { text: "Pet Bowl", path: "pet-supplies", type: "Pet Supplies", image: pet_supplies_image, price: 1200, oldPrice: 1400 },
  { text: "T-Shirt", path: "clothing-fashion", type: "Clothing & Fashion", image: clothing_fashion_image, price: 1500, oldPrice: 1800 },
];

// ==================== Best Sellers ====================
export const bestSellers = [
  {
    id: 1,
    name: "Helicopter 1",
    category: "Toys",
    price: 900,
    oldPrice: 1000,
    rating: 4,
    reviews: 4,
    image: helicopter1_image,
  },
  {
    id: 2,
    name: "Mugs 1",
    category: "Kitchen Items",
    price: 450,
    oldPrice: 500,
    rating: 5,
    reviews: 5,
    image: mugs1_image,
  },
  {
    id: 3,
    name: "Porcelain 1",
    category: "Kitchen Items",
    price: 1400,
    oldPrice: 1500,
    rating: 3,
    reviews: 3,
    image: porcelain1_image,
  },
  {
    id: 4,
    name: "Teddy",
    category: "Toys",
    price: 1200,
    oldPrice: 1300,
    rating: 4,
    reviews: 6,
    image: teddy_image,
  },
];
