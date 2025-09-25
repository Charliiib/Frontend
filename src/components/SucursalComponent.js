import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../api';

const SucursalesComponent = ({ onSucursalesChange }) => {
  // Estados para los datos
  const [barrios, setBarrios] = useState([]);
  const [allComercios, setAllComercios] = useState([]);
  const [filteredComercios, setFilteredComercios] = useState([]);
  const [allSucursalesBarrio, setAllSucursalesBarrio] = useState([]);
  const [filteredSucursales, setFilteredSucursales] = useState([]);
  
  // Estados para las selecciones
  const [selectedBarrio, setSelectedBarrio] = useState('');
  const [selectedComercios, setSelectedComercios] = useState([]);
  const [selectedSucursal, setSelectedSucursal] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
          const [barriosResponse, comerciosResponse] = await Promise.all([
            api.get('/barrios'),
            api.get('/comercios')
          ]);
        setBarrios(barriosResponse.data);
        setAllComercios(comerciosResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Cuando se selecciona un barrio
  useEffect(() => {
    const fetchSucursalesPorBarrio = async () => {
      if (selectedBarrio) {
        try {
          const response = await api.get(`/sucursales/por-barrio/${selectedBarrio}`);
          setAllSucursalesBarrio(response.data);
          
          const comerciosEnBarrio = [...new Set(
            response.data.map(s => `${s.idComercio},${s.idBandera}`)
          )];
          
          const comerciosFiltrados = allComercios.filter(comercio => 
            comerciosEnBarrio.includes(`${comercio.idComercio},${comercio.idBandera}`)
          );
          
          setFilteredComercios(comerciosFiltrados);
          setFilteredSucursales([]);
        } catch (error) {
          console.error('Error fetching sucursales:', error);
        }
      } else {
        setAllSucursalesBarrio([]);
        setFilteredComercios([]);
        setFilteredSucursales([]);
      }
      
      setSelectedComercios([]);
      setSelectedSucursal('');
    };
    
    fetchSucursalesPorBarrio();
  }, [selectedBarrio, allComercios]);

  // Cuando se seleccionan/deseleccionan comercios
  useEffect(() => {
    if (selectedComercios.length > 0) {
      const sucursalesFiltradas = allSucursalesBarrio.filter(sucursal => 
        selectedComercios.includes(`${sucursal.idComercio},${sucursal.idBandera}`)
      );
      setFilteredSucursales(sucursalesFiltradas);
    } else {
      setFilteredSucursales([]);
      setSelectedSucursal('');
    }
  }, [selectedComercios, allSucursalesBarrio]);

  const handleComercioSelection = (comercioId) => {
    setSelectedComercios(prev => {
      if (prev.includes(comercioId)) {
        return prev.filter(id => id !== comercioId);
      } else {
        return [...prev, comercioId];
      }
    });
  };

  // Opciones para los selects
  const barrioOptions = barrios.map(barrio => ({
    value: barrio.idBarrios,
    label: barrio.barriosNombre
  }));

  const sucursalOptions = filteredSucursales.map(sucursal => ({
    value: `${sucursal.idComercio},${sucursal.idBandera},${sucursal.idSucursal}`,
    label: sucursal.sucursalesNombre
  }));

useEffect(() => {
  if (filteredSucursales.length > 0 && onSucursalesChange) {
    onSucursalesChange(filteredSucursales);
  } else {
    onSucursalesChange([]);
  }
}, [filteredSucursales, onSucursalesChange]);
  
  return (
    <div className="mt-3" style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Selector de Barrios */}
      <div className="mb-4">
        <label className="form-label">Seleccione un barrio</label>
        <Select
          options={barrioOptions}
          value={barrioOptions.find(opt => opt.value === selectedBarrio)}
          onChange={(opt) => setSelectedBarrio(opt?.value || '')}
          placeholder="Seleccione un barrio"
          isClearable
          styles={{
            control: (base) => ({
              ...base,
              width: '100%'
            }),
            container: (base) => ({
              ...base,
              width: '100%'
            })
          }}
        />
      </div>
      
      {/* Comercios (solo visibles cuando hay un barrio seleccionado) */}
      {selectedBarrio && (
        <div className="mb-4">
          <label className="form-label">Comercios en {barrioOptions.find(b => b.value === selectedBarrio)?.label}</label>
          <div 
            className="d-flex flex-wrap justify-content-center gap-4 mt-4"
          >
            {filteredComercios.length > 0 ? (
              filteredComercios.map(comercio => {
                const imageUrl = `https://imagenes.preciosclaros.gob.ar/comercios/${comercio.idComercio}-${comercio.idBandera}.jpg`;
                const isSelected = selectedComercios.includes(`${comercio.idComercio},${comercio.idBandera}`);
                
                return (
                  <div 
                    key={`${comercio.idComercio}-${comercio.idBandera}`}
                    className={`d-flex flex-column align-items-center ${isSelected ? 'selected-comercio' : ''}`}
                    style={{
                      width: '140px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleComercioSelection(`${comercio.idComercio},${comercio.idBandera}`)}
                  >
                    {/* Contenedor de la imagen */}
                    <div
                      className="position-relative"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: isSelected ? '3px solid #0d6efd' : '1px solid #dee2e6',
                        boxShadow: isSelected ? '0 0 10px rgba(13, 110, 253, 0.5)' : 'none',
                        marginBottom: '8px'
                      }}
                    >
                      <img 
                        src={imageUrl} 
                        alt={comercio.comercioBanderaNombre}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                      {/* Checkbox circular */}
                      <div 
                        className="position-absolute top-0 end-0 m-1 bg-white rounded-circle"
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #ddd'
                        }}
                      >
                        {isSelected && (
                          <div 
                            className="bg-primary rounded-circle"
                            style={{
                              width: '16px',
                              height: '16px'
                            }}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Nombre del comercio - ahora fuera del contenedor de la imagen */}
                    <div 
                      className="text-center mt-2"
                      style={{
                        width: '100%',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        color: isSelected ? '#0d6efd' : '#495057',
                        wordBreak: 'break-word'
                      }}
                    >
                      {comercio.comercioBanderaNombre}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-muted py-4">
                No hay comercios disponibles en este barrio
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SucursalesComponent;