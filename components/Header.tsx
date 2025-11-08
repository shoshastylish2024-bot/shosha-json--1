import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center lg:text-left">
      <h1 className="text-2xl sm:text-3xl font-bold text-amber-500">
        Shosha<span className="text-slate-900">Stylish</span>
      </h1>
      <p className="text-slate-600 mt-2 text-sm">
        AI Fashion Session Builder – by Mohammed Shosha. Generate luxury mannequin photoshoots from outfit references.
      </p>
    </header>
  );
};

export default Header;