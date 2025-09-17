import React from 'react';

const TikTokSection = () => {
  // Array of TikTok videos with direct video files
  const tiktokVideos = [
    {
      id: '7442916969825963269',
      url: 'https://vt.tiktok.com/ZSDB29NCj/',
      videoSrc: '/tiktok-video.mp4', // نحط الفيديو في public folder
      thumbnail: '/tiktok-thumbnail.jpg', // صورة مصغرة للفيديو
      title: 'Check out our latest collection!',
      username: '@givento.eg'
    }
  ];
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-cairo">
            Follow Us on TikTok
          </h2>
          <p className="text-gray-600 text-lg font-cairo">
            Check out our latest video
          </p>
        </div>

        {/* Single Video - Centered */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm">
            <div className="relative aspect-[9/16] bg-black">
              {/* HTML5 Video Player */}
              <video
                className="absolute inset-0 w-full h-full object-cover"
                controls
                poster={tiktokVideos[0].thumbnail}
                preload="metadata"
                playsInline
              >
                <source src={tiktokVideos[0].videoSrc} type="video/mp4" />
                {/* Fallback content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.10z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-cairo">{tiktokVideos[0].username}</h3>
                  <p className="text-sm mb-6 opacity-90 font-cairo">{tiktokVideos[0].title}</p>
                  <a 
                    href={tiktokVideos[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 font-cairo inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Watch on TikTok
                  </a>
                </div>
              </video>
            </div>
            
            {/* Video Info */}
            <div className="p-4 text-center">
              <h4 className="font-semibold text-gray-800 mb-2 font-cairo">{tiktokVideos[0].username}</h4>
              <p className="text-sm text-gray-600 mb-3 font-cairo">{tiktokVideos[0].title}</p>
              <a 
                href={tiktokVideos[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all duration-300 font-cairo"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.10z"/>
                </svg>
                Watch Full Video
              </a>
            </div>
          </div>
        </div>

        {/* Follow Button */}
        <div className="text-center mt-12">
          <a 
            href="https://www.tiktok.com/@givento.eg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-cairo"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.10z"/>
            </svg>
            Follow @givento.eg
          </a>
        </div>
      </div>
    </section>
  );
};

export default TikTokSection;
