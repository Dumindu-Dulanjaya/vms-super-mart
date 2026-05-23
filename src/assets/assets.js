// ==================== Import Images ====================

// ===== Banner =====
import bottom_banner_image from "./banner1girl.jpg";   // desktop version
import bottom_banner_image_sm from "./banner1girl.jpg"; // mobile version

// ===== Feature Icons =====
import feature_icon_1 from "./icons/feature1.png";
import feature_icon_2 from "./icons/feature2.png";
import feature_icon_3 from "./icons/feature3.png";

// ===== Category Icons =====
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
export const bestSellers = [];
