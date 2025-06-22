import React, { useState, useEffect } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const UbicacionComponent = ({ onLocationChange }) => {
  const [location, setLocation] = useState({
    address: "Av. Corrientes 1234, CABA",
    coords: null,
    loading: false,
    error: null
  });
  const [showLocationRequest, setShowLocationRequest] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLocationRequest(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Componente para manejar clics en el mapa
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setMapCoords(e.latlng);
      },
    });
    return null;
  }

  const getLocation = async (coords = null) => {
    try {
      setLocation({ ...location, loading: true, error: null });
      setShowLocationRequest(false);
      
      let latitude, longitude;
      
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      } else {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      const address = await getAddressFromCoords(latitude, longitude);

      const newLocation = {
        address: address || "Ubicación no identificada",
        coords: { lat: latitude, lng: longitude },
        loading: false,
        error: null
      };
      
      setLocation(newLocation);
      setShowMapModal(false);
      
      // Notificar al componente padre sobre el cambio de ubicación
      if (onLocationChange) {
        onLocationChange(newLocation.coords);
      }
    } catch (error) {
      setLocation({
        ...location,
        loading: false,
        error: getErrorMessage(error)
      });
    }
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (!data.address) {
        throw new Error("Dirección no disponible");
      }
      
      return formatAddress(data.address);
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
      return null;
    }
  };

  const formatAddress = (address) => {
    const parts = [];
    if (address.road) parts.push(address.road);
    if (address.house_number) parts.push(address.house_number);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  };

  const getErrorMessage = (error) => {
    if (error.code) {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          return "Permiso de ubicación denegado";
        case error.POSITION_UNAVAILABLE:
          return "Ubicación no disponible";
        case error.TIMEOUT:
          return "Tiempo de espera agotado";
        default:
          return "Error al obtener ubicación";
      }
    }
    return error.message || "Error desconocido";
  };

  const handleMapSelection = () => {
    setShowLocationRequest(false);
    setShowMapModal(true);
    setMapCoords(location.coords || { lat: -34.6037, lng: -58.3816 }); // Default: Buenos Aires
  };

  return (
    <>
      {/* Modal de solicitud de ubicación */}
      <Modal 
        show={showLocationRequest} 
        onHide={() => setShowLocationRequest(false)}
        centered
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-location-dot me-2"></i> Mejor experiencia con ubicación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Para mostrarte información más relevante, necesitamos acceder a tu ubicación.</p>
          <p className="text-muted small">
            <i className="fas fa-info-circle me-1"></i> Puedes permitir la detección automática o seleccionar en el mapa.
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={() => setShowLocationRequest(false)}>
            Ahora no
          </Button>
          <div>
            <Button variant="outline-primary" onClick={handleMapSelection} className="me-2">
              <i className="fas fa-map me-1"></i> Seleccionar en mapa
            </Button>
            <Button variant="primary" onClick={() => getLocation()}>
              <i className="fas fa-location-crosshairs me-1"></i> Detectar automáticamente
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Modal para selección en mapa */}
      <Modal 
        show={showMapModal} 
        onHide={() => setShowMapModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-map-marked-alt me-2"></i> Selecciona tu ubicación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: '400px' }}>
          <MapContainer 
            center={mapCoords || [-34.6037, -58.3816]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {mapCoords && (
              <Marker position={mapCoords}>
                <Popup>Ubicación seleccionada</Popup>
              </Marker>
            )}
          </MapContainer>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowMapModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => getLocation(mapCoords)} 
            disabled={!mapCoords}
          >
            Confirmar ubicación
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Componente de ubicación original */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <i className="fas fa-location-dot me-2"></i>Mi ubicación
        </h3>

        {location.error && (
          <Alert variant="danger" className="mt-2" dismissible onClose={() => setLocation({...location, error: null})}>
            {location.error}
          </Alert>
        )}

        <div className="d-flex align-items-center">
          <i className="fas fa-location-crosshairs me-2"></i>
          {location.loading ? (
            <span className="text-muted">Obteniendo ubicación...</span>
          ) : (
            <span>{location.address} </span>
          )}
        </div>
        
        <div className="d-flex gap-2 mt-2">
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="flex-grow-1"
            onClick={() => setShowLocationRequest(true)}
            disabled={location.loading}
          >
            {location.loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Detectando...
              </>
            ) : (
              "Cambiar ubicación"
            )}
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={handleMapSelection}
            title="Seleccionar en mapa"
          >
            <i className="fas fa-map"></i>
          </Button>
        </div>
      </div>
    </>
  );
};



export default UbicacionComponent;