import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa';
import api from '../api';

export const CercanasComponent = ({ userLocation }) => {
  const [sucursalesCercanas, setSucursalesCercanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSucursalesCercanas = async () => {
      if (!userLocation) return;
      
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/sucursales/cercanas', {
          params: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            limit: 10
          }
        });
        
        setSucursalesCercanas(response.data);
      } catch (err) {
        console.error('Error fetching nearby branches:', err);
        setError('Error al cargar sucursales cercanas');
      } finally {
        setLoading(false);
      }
    };

    fetchSucursalesCercanas();
  }, [userLocation]);

  const formatDistance = (distance) => {
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

  const openInMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const getComercioImageUrl = (sucursal) => {
    return `https://imagenes.preciosclaros.gob.ar/comercios/${sucursal.idComercio}-${sucursal.idBandera}.jpg`;
  };

  return (
    <div className="sidebar-section">
      <h3 className="sidebar-title">
        <FaMapMarkerAlt className="me-2" />
        Sucursales cercanas

      </h3>
      
      {loading && (
        <div className="text-center my-3">
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Buscando sucursales cercanas...</span>
        </div>
      )}
      
      {error && (
        <div className="alert alert-warning py-2">
          <small>{error}</small>
        </div>
      )}

      {!userLocation ? (
        <div className="alert alert-info py-2">
          <small>Activa tu ubicación para ver sucursales cercanas</small>
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {sucursalesCercanas.length > 0 ? (
            sucursalesCercanas.map((sucursal, index) => (
              <li key={index} className="list-group-item p-2">
                <div className="d-flex align-items-center justify-content-between">
                  {/* Imagen del comercio (33% del ancho) */}
                  <div className="d-flex justify-content-center" style={{ width: '33%' }}>
                    <img 
                      src={getComercioImageUrl(sucursal)} 
                      alt={sucursal.comercioBanderaNombre}
                      className="rounded"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/30?text=ND';
                      }}
                    />
                  </div>
                  
                  {/* Flecha (33% del ancho) */}
                  <div className="d-flex justify-content-center" style={{ width: '33%' }}>
                    <FaArrowRight className="text-muted" />
                  </div>
                  
                  {/* Distancia y botón de mapa (33% del ancho) */}
                  <div className="d-flex justify-content-center align-items-center" style={{ width: '33%' }}>
                    <span className="text-muted small me-2">
                      {formatDistance(sucursal.distancia)}
                    </span>
                    <button 
                      onClick={() => openInMaps(sucursal.sucursalesLatitud, sucursal.sucursalesLongitud)}
                      className="btn btn-sm btn-link p-0"
                      title="Ver en mapa"
                    >
                      <FaExternalLinkAlt size={12} />
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            !loading && (
              <li className="list-group-item text-muted p-2">
                <small>No se encontraron sucursales cercanas</small>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default CercanasComponent;