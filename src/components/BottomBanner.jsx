import React from 'react'
import { assets } from '../assets/assets'

const features = [
  {
    icon: assets.feature_icon_1,
    title: "Fast Service",
    description: "We provide quick and reliable service."
  },
  {
    icon: assets.feature_icon_2,
    title: "Quality Care",
    description: "Best medical staff and equipment."
  },
  {
    icon: assets.feature_icon_3,
    title: "Affordable",
    description: "Services at reasonable costs."
  }
]

const BottomBanner = () => {
  return (
    <div className="relative mt-24">
      {/* ✅ Banner Images */}
      <img
        src={assets.bottom_banner_image}
        alt="banner"
        className="w-full hidden md:block"
      />
      <img
        src={assets.bottom_banner_image_sm}
        alt="banner"
        className="w-full md:hidden"
      />

      {/* ✅ Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center md:items-end md:justify-center pt-16 md:pt-0 md:pr-24">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
            Why We Are the Best?
          </h1>

          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 mt-4">
              <img
                src={feature.icon}
                alt={feature.title}
                className="w-9 md:w-11"
              />
              <div>
                <h3 className="text-lg md:text-xl font-semibold">
                  {feature.title}
                </h3>
                <p className="text-gray-500/70 text-xs md:text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BottomBanner
