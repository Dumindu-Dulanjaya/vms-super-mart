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
    <div className="flex flex-col gap-10 md:gap-16">
      <MainBanner />
      
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 pb-16 flex flex-col gap-10 md:gap-16">
        <ServiceFeatures />
        <FlashSales />
        <Categories />
        <BestSeller />
        <BottomBanner />
        <NewsLetter />
      </div>
    </div>
  );
};

export default Home;