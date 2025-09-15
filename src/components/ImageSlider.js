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
      image: '/hero.webp',
      buttonText: 'Shop New',
      link: '/category/t-shirt'
    },
    {
      id: 2,
      title: 'Winter Collection',
      image: '/hero.webp',
      buttonText: 'Shop New',
      link: '/category/hoodies'
    },
    {
      id: 3,
      title: 'Cap Collection',
      image: '/cap.jpg',
      buttonText: 'Shop New',
      link: '/category/cap'
    },
    {
      id: 4,
      title: 'Pants Collection',
      image: '/hero.webp',
      buttonText: 'Shop New',
      link: '/category/pants'
    },
    {
      id: 5,
      title: 'Zip-up Collection',
      image: '/hero.webp',
      buttonText: 'Shop New',
      link: '/category/zip-up'
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
                <div className="absolute inset-0 flex flex-col items-center text-center px-4" style={{ paddingTop: '60%' }}>
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-12 font-cairo drop-shadow-lg">
                    {slide.title}
                  </h2>
                  
                  <Link 
                    to={slide.link}
                    className="text-white text-lg font-cairo underline-none border-none bg-transparent hover:text-gray-200 transition-colors duration-200"
                    style={{ textDecoration: 'none', border: 'none', outline: 'none' }}
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
