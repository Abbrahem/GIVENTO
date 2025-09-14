import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const sliderRef = useRef(null);

  const slides = [
    {
      id: 1,
      title: 'Summer Collection',
      subtitle: 'Discover the latest trends',
      image: '/hero.webp',
      buttonText: 'Shop Now',
      link: '/category/t-shirt'
    },
    {
      id: 2,
      title: 'Winter Collection',
      subtitle: 'Stay warm in style',
      image: '/hero.webp',
      buttonText: 'Shop Now',
      link: '/category/hoodies'
    },
    {
      id: 3,
      title: 'New Arrivals',
      subtitle: 'Fresh styles just in',
      image: '/hero.webp',
      buttonText: 'Explore',
      link: '/products'
    },
    {
      id: 4,
      title: 'Special Offers',
      subtitle: 'Limited time deals',
      image: '/hero.webp',
      buttonText: 'Save Now',
      link: '/products'
    },
    {
      id: 5,
      title: 'Premium Quality',
      subtitle: 'Crafted with excellence',
      image: '/hero.webp',
      buttonText: 'Discover',
      link: '/products'
    }
  ];

  // Auto-rotate slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false); // Pause auto-play when user interacts
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }

    // Resume auto-play after 3 seconds of no interaction
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Mouse handlers for desktop drag
  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    setIsAutoPlaying(false);
    sliderRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (touchStartX.current === 0) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!touchStartX.current || !touchEndX.current) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      sliderRef.current.style.cursor = 'grab';
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    sliderRef.current.style.cursor = 'grab';
    
    // Resume auto-play after 3 seconds of no interaction
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div 
          ref={sliderRef}
          className="relative h-96 md:h-[500px] rounded-xl overflow-hidden shadow-2xl cursor-grab select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Slides Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className="min-w-full h-full relative">
                {/* Background Image */}
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 font-cairo drop-shadow-lg">
                    {slide.title}
                  </h2>
                  
                  <p className="text-xl md:text-2xl text-white mb-8 font-cairo drop-shadow-md opacity-90">
                    {slide.subtitle}
                  </p>
                  
                  <Link 
                    to={slide.link}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-red-800 transition-all duration-300 transform hover:scale-105 font-cairo drop-shadow-lg button-split-primary"
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentSlide(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 3000);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageSlider;
