import Image from "next/image";
import React, { useState } from "react";

const BannerCarousel = () => {
  const [current, setCurrent] = useState(0);
  const banners = [
    "/banner4.jpg",
    "/banner2.jpg",
    "/banner1.jpg",
    "/banner1.jpg",
    "/banner5.jpg",
    "/banner6.jpg",
  ];

  const handleNext = () => {
    setCurrent(current === banners.length - 3 ? 0 : current + 1);
  };

  const handlePrev = () => {
    setCurrent(current === 0 ? banners.length - 3 : current - 1);
  };

  const disablePrev = current === 0;
  const disableNext = current === banners.length - 3;

  return (
    <div className="relative flex items-center h-full">
      <button
        onClick={handlePrev}
        className="absolute left-0 text-white z-10 text-6xl"
        disabled={disablePrev}
      >
        {disablePrev ? "" : "<"}
      </button>
      <div className="flex overflow-hidden w-full h-full">
        {banners.slice(current, current + 3).map((banner, index) => (
          <div key={index} className="w-full relative mx-1 my-1">
            <Image src={banner} alt={`Banner ${index}`} fill center />
          </div>
        ))}
      </div>
      <button
        onClick={handleNext}
        className="absolute right-0 text-white z-10 text-6xl"
        disabled={disableNext}
      >
        {disableNext ? "" : ">"}
      </button>
    </div>
  );
};

export default BannerCarousel;
