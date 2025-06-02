import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const SucursalesComponent = () => {
  // Estados para los datos
  const [barrios, setBarrios] = useState([]);
  const [allComercios, setAllComercios] = useState([]);
  const [filteredComercios, setFilteredComercios] = useState([]);
  const [allSucursalesBarrio, setAllSucursalesBarrio] = useState([]);
  const [filteredSucursales, setFilteredSucursales] = useState([]);
  
  // Estados para las selecciones
  const [selectedBarrio, setSelectedBarrio] = useState('');
  const [selectedComercio, setSelectedComercio] = useState('');
  const [selectedComercioData, setSelectedComercioData] = useState(null); // Datos del comercio seleccionado
  const [selectedSucursal, setSelectedSucursal] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barriosResponse, comerciosResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/barrios'),
          axios.get('http://localhost:8080/api/comercios')
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
          const response = await axios.get(`http://localhost:8080/api/sucursales/por-barrio/${selectedBarrio}`);
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
        setFilteredComercios(allComercios);
        setFilteredSucursales([]);
      }
      
      setSelectedComercio('');
      setSelectedComercioData(null);
      setSelectedSucursal('');
    };
    
    fetchSucursalesPorBarrio();
  }, [selectedBarrio, allComercios]);

  // Cuando se selecciona un comercio
  useEffect(() => {
    if (selectedComercio) {
      const [idComercio, idBandera] = selectedComercio.split(',');
      
      // Encontrar el comercio seleccionado para obtener sus datos
      const comercioSeleccionado = allComercios.find(c => 
        c.idComercio.toString() === idComercio && 
        c.idBandera.toString() === idBandera
      );
      
      setSelectedComercioData(comercioSeleccionado || null);
      
      // Filtrar sucursales
      const sucursalesFiltradas = allSucursalesBarrio.filter(sucursal => 
        sucursal.idComercio.toString() === idComercio && 
        sucursal.idBandera.toString() === idBandera
      );
      
      setFilteredSucursales(sucursalesFiltradas);
      setSelectedSucursal('');
    } else {
      setSelectedComercioData(null);
      setFilteredSucursales([]);
    }
  }, [selectedComercio, allSucursalesBarrio, allComercios]);

  // Opciones para los selects
  const barrioOptions = barrios.map(barrio => ({
    value: barrio.idBarrios,
    label: barrio.barriosNombre
  }));

  const comercioOptions = filteredComercios.map(comercio => ({
    value: `${comercio.idComercio},${comercio.idBandera}`,
    label: comercio.comercioBanderaNombre,
    data: comercio
  }));

  const sucursalOptions = filteredSucursales.map(sucursal => ({
    value: `${sucursal.idComercio},${sucursal.idBandera},${sucursal.idSucursal}`,
    label: sucursal.sucursalesNombre
  }));

  // URL de la imagen del comercio seleccionado
  const comercioImageUrl = selectedComercioData 
    ? `https://imagenes.preciosclaros.gob.ar/comercios/${selectedComercioData.idComercio}-${selectedComercioData.idBandera}.jpg`
    : null;

  return (
    <div className="mt-3" style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Primera fila: Barrios y Comercios */}
      <div className="d-flex mb-3" style={{ gap: '15px' }}>
        {/* Barrios */}
        <div style={{ flex: 1 }}>
          <label className="form-label">Barrios</label>
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
        
        {/* Comercios */}
        <div style={{ flex: 1 }}>
          <label className="form-label">Comercio</label>
          <Select
            options={comercioOptions}
            value={comercioOptions.find(opt => opt.value === selectedComercio)}
            onChange={(opt) => {
              setSelectedComercio(opt?.value || '');
              setSelectedComercioData(opt?.data || null);
            }}
            placeholder={selectedBarrio ? 'Seleccione un comercio' : 'Primero seleccione un barrio'}
            isDisabled={!selectedBarrio}
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
      </div>

      {/* Segunda fila: Sucursales e Imagen */}
      <div className="d-flex" style={{ gap: '15px' }}>
        {/* Sucursales */}
        <div style={{ flex: 1 }}>
          <label className="form-label mt-4">Sucursal</label>
          <Select
            options={sucursalOptions}
            value={sucursalOptions.find(opt => opt.value === selectedSucursal)}
            onChange={(opt) => setSelectedSucursal(opt?.value || '')}
            placeholder={selectedComercio ? 'Seleccione una sucursal' : 'Primero seleccione un comercio'}
            isDisabled={!selectedComercio}
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
        
        {/* Imagen del Comercio */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: 'none',
          
          minHeight: '72px' // Altura aproximada del select
        }}>
          {selectedComercioData ? (
            <div 
              className="text-center p-2"
              style={{
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img 
                src={comercioImageUrl} 
                alt={`Logo de ${selectedComercioData.comercioBanderaNombre}`}
                style={{
                  maxHeight: '100px',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
              <p className="mt-2 mb-0 small text-muted">
                {selectedComercioData.comercioBanderaNombre}
              </p>
            </div>
          ) : (
            <div className="text-muted small text-center p-3">
           
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SucursalesComponent;