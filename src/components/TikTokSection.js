import React from 'react';

const TikTokSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 font-cairo">
            TikTok Videos
          </h2>
        </div>

        {/* Single Video */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm">
            <div className="relative aspect-[9/16] bg-black">
              <iframe
                src="https://www.tiktok.com/embed/v2/7234567890123456789"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="TikTok Video"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TikTokSection;
