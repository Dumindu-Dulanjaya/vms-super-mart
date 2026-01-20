import React from 'react';
import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import BestSeller from '../components/BestSeller';
import BottomBanner from '../components/BottomBanner';
import NewsLetter from '../components/NewsLetter';
import FlashSales from '../components/FlashSales';
import ServiceFeatures from '../components/ServiceFeatures';

const Home = () => {
  return (
    <div className="mt-10">
      <MainBanner />
      <ServiceFeatures />
      <FlashSales />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <NewsLetter />
    </div>
  );
};

export default Home;