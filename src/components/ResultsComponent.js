import React from 'react'
import { useState } from 'react';
import { Dropdown  } from 'react-bootstrap';

export const ResultsComponent = () => {
    const initialProducts =[
    { Imagen: 'https://imagenes.preciosclaros.gob.ar/productos/7790895067570.jpg', Marca: 'Coca-Cola', Presentacion: '2.25l', Precio: 320, Comercio: 'Carrefour', Sucursal: 'Microcentro', Distancia: 1.5},
    { Imagen: 'https://imagenes.preciosclaros.gob.ar/productos/7790895067570.jpg', Marca: 'Coca-Cola', Presentacion: '2.25l', Precio: 520, Comercio: 'Dia', Sucursal: 'Almagro', Distancia: 0.8 },
    { Imagen: 'https://imagenes.preciosclaros.gob.ar/productos/7790895067570.jpg', Marca: 'Coca-Cola', Presentacion: '2.25l', Precio: 3340, Comercio: 'Jumbo', Sucursal: 'Palermo', Distancia: 0.6 },
    { Imagen: 'https://imagenes.preciosclaros.gob.ar/productos/7790895067570.jpg', Marca: 'Coca-Cola', Presentacion: '2.25l', Precio: 620, Comercio: 'Disco', Sucursal: 'Recoleta', Distancia: 1.3 },
    { Imagen: 'https://imagenes.preciosclaros.gob.ar/productos/7790895067570.jpg', Marca: 'Coca-Cola', Presentacion: '2.25l', Precio: 110, Comercio: 'Coto', Sucursal: 'Once', Distancia: 2.2 },
  ];

  const [products, setProducts] = useState(initialProducts);
  const [sortMethod, setSortMethod] = useState('default');

  // Funciones de ordenamiento
  const sortProducts = (method) => {
    setSortMethod(method);
    const sorted = [...initialProducts]; // Siempre ordenamos desde los datos originales

    switch (method) {
      case 'precio-asc':
        sorted.sort((a, b) => a.Precio - b.Precio);
        break;
      case 'precio-desc':
        sorted.sort((a, b) => b.Precio - a.Precio);
        break;
      case 'distancia-asc':
        sorted.sort((a, b) => a.Distancia - b.Distancia);
        break;
      case 'distancia-desc':
        sorted.sort((a, b) => b.Distancia - a.Distancia);
        break;
      default:
        // Mantener orden original
        break;
    }

    setProducts(sorted);
  };

  // Texto del botón según el orden actual
  const getButtonText = () => {
    switch (sortMethod) {
      case 'precio-asc': return 'Menor precio';
      case 'precio-desc': return 'Mayor precio';
      case 'distancia-asc': return 'Más cercano';
      case 'distancia-desc': return 'Más lejano';
      default: return 'Ordenar por';
    }
  };

  return (

    <main class="col-lg-9">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Resultados de búsqueda</h2>
        <Dropdown className="mb-3">
        <Dropdown.Toggle variant="btn btn-outline-secondary" id="dropdown-sort">
          {getButtonText()}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Header>Precio</Dropdown.Header>
          <Dropdown.Item onClick={() => sortProducts('precio-asc')}>Menor precio</Dropdown.Item>
          <Dropdown.Item onClick={() => sortProducts('precio-desc')}>Mayor precio</Dropdown.Item>
          
          <Dropdown.Divider />
          
          <Dropdown.Header>Distancia</Dropdown.Header>
          <Dropdown.Item onClick={() => sortProducts('distancia-asc')}>Más cercano</Dropdown.Item>
          <Dropdown.Item onClick={() => sortProducts('distancia-desc')}>Más lejano</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
    

    <div class="table-responsive">
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th>Imagen</th>
                    <th>Marca</th>
                    <th>Presentación</th>
                    <th>Precio</th>
                    <th>Comercio</th>
                    <th>Sucursal</th>
                    <th>Distancia</th>
                </tr>
            </thead>
            <tbody id="resultsTable">
                {products.map((product) => (
                <tr>
                    <td><img src={product.Imagen} class="product-img" alt="Coca-Cola"/></td>
                    <td>{product.Marca}</td>
                    <td>{product.Presentacion}</td>
                    <td class="fw-bold text-primary">${product.Precio}</td>
                    <td>{product.Comercio}</td>
                    <td>{product.Sucursal}</td>
                    <td>{product.Distancia} km</td>
                </tr>
             ))}
            </tbody>
        </table>
    </div>
</main>

  )
}

export default ResultsComponent;