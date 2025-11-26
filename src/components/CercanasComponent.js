import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaArrowRight, FaMap } from 'react-icons/fa';
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
            limit: 100 // Aumentamos el límite para obtener más resultados y luego filtrar
          }
        });
        
        // Filtrar sucursales para mantener solo la más cercana de cada comercio/bandera
        const sucursalesUnicas = filtrarSucursalesUnicas(response.data);
        setSucursalesCercanas(sucursalesUnicas);
      } catch (err) {
        console.error('Error fetching nearby branches:', err);
        setError('Error al cargar sucursales cercanas');
      } finally {
        setLoading(false);
      }
    };

    fetchSucursalesCercanas();
  }, [userLocation]);

  // Función para filtrar sucursales y mantener solo la más cercana de cada comercio
  const filtrarSucursalesUnicas = (sucursales) => {
    const comerciosUnicos = {};
    
    sucursales.forEach(sucursal => {
      const clave = `${sucursal.idComercio}-${sucursal.idBandera}`;
      
      // Si no tenemos este comercio/bandera, o si esta sucursal es más cercana que la que tenemos
      if (!comerciosUnicos[clave] || sucursal.distancia < comerciosUnicos[clave].distancia) {
        comerciosUnicos[clave] = sucursal;
      }
    });
    
    // Convertir el objeto de vuelta a array y ordenar por distancia
    return Object.values(comerciosUnicos)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 10); // Mostramos máximo 10 comercios únicos
  };

  const formatDistance = (distance) => {
    if (distance < 1) return `${Math.round(distance * 1000)} m`;
    return `${distance.toFixed(1)} km`;
  };

  const openInMaps = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const getComercioImageUrl = (sucursal) => {
    return `https://imagenes.preciosclaros.gob.ar/comercios/${sucursal.idComercio}-${sucursal.idBandera}.jpg`;
  };

  return (
    <div className="sidebar-section bg-light rounded-3 shadow-sm">
      <h3 className="sidebar-title fw-bold text-primary">
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
        <div className="alert alert-warning py-2 small border-0 rounded-3">
          <small>{error}</small>
        </div>
      )}

      {!userLocation ? (
        <div className="alert alert-info py-2 small border-0 rounded-3">
          <small>Activa tu ubicación para ver sucursales cercanas</small>
        </div>
      ) : (
        <ul className="list-group list-group-flush">
          {sucursalesCercanas.length > 0 ? (
            sucursalesCercanas.map((sucursal, index) => (
              <li 
                key={index} 
                className="list-group-item p-3 bg-white border rounded-3 mb-2 shadow-sm list-card-hover"
                style={{ borderLeft: "5px solid var(--bs-secondary)" }}
              >
                <div className="d-flex align-items-center">
                  <div className="me-3 flex-shrink-0">
                    <img 
                      src={getComercioImageUrl(sucursal)} 
                      alt={sucursal.comercioBanderaNombre}
                      className="rounded-circle border"
                      style={{ 
                        width: '45px', 
                        height: '45px', 
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/45?text=ND';
                      }}
                    />
                  </div>
                  
                  <div className="flex-grow-1 overflow-hidden">
                    <h6 className="mb-1 fw-bold text-dark text-truncate" title={sucursal.comercioBanderaNombre}>
                      {sucursal.comercioBanderaNombre}
                    </h6>
                    <small className="text-muted d-block text-truncate" title={sucursal.sucursalNombre}>
                      {sucursal.sucursalNombre || 'Mas cercano a'}
                    </small>
                  </div>
                  
                  <div className="text-end flex-shrink-0 ms-3">
                    <span className="d-block fw-bold text-primary">
                      {formatDistance(sucursal.distancia)}
                    </span>
                    <button 
                      onClick={() => openInMaps(sucursal.sucursalesLatitud, sucursal.sucursalesLongitud)}
                      className="btn btn-sm btn-link p-0 small text-secondary"
                      title="Ver en mapa"
                    >
                      <FaMap className="me-1" size={12} />
                      Mapa
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            !loading && (
              <li className="list-group-item text-muted p-2 bg-white rounded-3 shadow-sm">
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