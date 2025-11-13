import React from 'react';

export const BannerComponent = () => {
  return (
    // Clase Banner (compra-banner) definida en App.css
    <div className="compra-banner mb-5 mt-0"> 
        <div className="compra-content py-5">
            <h1 className="display-5 fw-bold text-shadow-lg">
                Compara precios en tus comercios favoritos
            </h1>
            <p className="lead text-shadow-lg">
                Encuentra los mejores precios cerca de tu ubicación
            </p>
        </div>
    </div>
  );
};

export default BannerComponent;