// ==================== Import Images ====================

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

// ==================== Categories ====================

export const categories = [
  // ===== Toys =====
  { text: "Car 1", path: "Toys", image: car1_image, bgColor: "#E6F7FF" },
  { text: "Car 2", path: "Toys", image: car2_image, bgColor: "#FFF0F6" },
  { text: "Car 3", path: "Toys", image: car3_image, bgColor: "#FFFBE6" },
  { text: "Car 4", path: "Toys", image: car4_image, bgColor: "#F6FFED" },
  { text: "Car 5", path: "Toys", image: car5_image, bgColor: "#FFF1F0" },
  { text: "Car 6", path: "Toys", image: car6_image, bgColor: "#E6FFFB" },
  { text: "Car 7", path: "Toys", image: car7_image, bgColor: "#F9F0FF" },
  { text: "Helicopter 1", path: "Toys", image: helicopter1_image, bgColor: "#FFFBE6" },
  { text: "Helicopter 2", path: "Toys", image: helicopter2_image, bgColor: "#F6FFED" },
  { text: "Minion", path: "Toys", image: minion_image, bgColor: "#E6F7FF" },
  { text: "Teddy", path: "Toys", image: teddy_image, bgColor: "#FFF0F6" },

  // ===== Kitchen Items =====
  { text: "Aluminium Pots 1", path: "Kitchen", image: aluminiumpots1_image, bgColor: "#FFFBE6" },
  { text: "Aluminium Pots 2", path: "Kitchen", image: aluminiumpots2_image, bgColor: "#E6FFFB" },
  { text: "Aluminium Pots 3", path: "Kitchen", image: aluminiumpots3_image, bgColor: "#FFF1F0" },

  { text: "Mugs 1", path: "Kitchen", image: mugs1_image, bgColor: "#F6FFED" },
  { text: "Mugs 2", path: "Kitchen", image: mugs2_image, bgColor: "#FFFBE6" },
  { text: "Mugs 3", path: "Kitchen", image: mugs3_image, bgColor: "#E6F7FF" },
  { text: "Mugs 4", path: "Kitchen", image: mugs4_image, bgColor: "#FFF0F6" },

  { text: "Porcelain 1", path: "Kitchen", image: porcelain1_image, bgColor: "#FFF1F0" },
  { text: "Porcelain 2", path: "Kitchen", image: porcelain2_image, bgColor: "#F6FFED" },
  { text: "Porcelain 3", path: "Kitchen", image: porcelain3_image, bgColor: "#E6FFFB" },
  { text: "Porcelain 4", path: "Kitchen", image: porcelain4_image, bgColor: "#FFFBE6" },
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
    category: "Kitchen",
    price: 450,
    oldPrice: 500,
    rating: 5,
    reviews: 5,
    image: mugs1_image,
  },
  {
    id: 3,
    name: "Porcelain 1",
    category: "Kitchen",
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
