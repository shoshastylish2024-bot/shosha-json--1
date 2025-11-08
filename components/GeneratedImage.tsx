import React from 'react';

interface GeneratedImageProps {
  src?: string;
  isLoading: boolean;
  aspectRatio: string;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ src, isLoading, aspectRatio }) => {
  const getAspectRatioClass = (ratio: string) => {
    const ratioMap: { [key: string]: string } = {
      '1:1': 'aspect-square',
      '3:4': 'aspect-[3/4]',
      '4:3': 'aspect-[4/3]',
      '9:16': 'aspect-[9/16]',
      '16:9': 'aspect-[16/9]',
    };
    return ratioMap[ratio] || 'aspect-square';
  }

  const aspectRatioClass = getAspectRatioClass(aspectRatio);

  if (isLoading) {
    return (
      <div className={`w-full bg-slate-200 rounded-lg animate-pulse ${aspectRatioClass}`}></div>
    );
  }

  if (!src) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `shoshastylish-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative">
      <img src={src} alt="Generated fashion photoshoot" className={`w-full h-auto rounded-lg object-contain bg-slate-100/50 ${aspectRatioClass}`} />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
        <button
          onClick={handleDownload}
          className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-white/30 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default GeneratedImage;