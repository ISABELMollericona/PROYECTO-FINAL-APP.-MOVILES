// Declarar la función global para evitar error de TypeScript
declare global {
  interface Window {
    initMap: () => void;
  }
}

import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../services/firebase';

// Definir el tipo de farmacia
interface Farmacia {
  id: string;
  nombre?: string;
  Nombre?: string;
  direccion?: string;
  lat: number;
  lng: number;
  [key: string]: any;
}

export const Mapa: React.FC = () => {
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFarmacia, setSelectedFarmacia] = useState<Farmacia | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Cargar farmacias solo una vez
  useEffect(() => {
    fetch('http://localhost:4000/farmacias')
      .then(res => res.json())
      .then((farmaciasData: Farmacia[]) => {
        const farmaciasFiltradas = farmaciasData.filter(f => typeof f.lat === 'number' && typeof f.lng === 'number');
        setFarmacias(farmaciasFiltradas);
        if (farmaciasFiltradas.length === 0) {
          setError('No hay farmacias con lat/lng en la base de datos.');
        }
      })
      .catch(() => setError('Error al cargar farmacias de la base de datos.'));
  }, []);

  // Cargar Google Maps y mostrar marcadores
  useEffect(() => {
    if (!farmacias.length) return;
    function renderMap() {
      try {
        const center = farmacias.length > 0 ? { lat: farmacias[0].lat, lng: farmacias[0].lng } : { lat: -17.392, lng: -66.157 };
        mapRef.current = new window.google.maps.Map(document.getElementById('map') as HTMLElement, {
          zoom: 13,
          center,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', stylers: [{ color: '#304a7d' }] },
            { featureType: 'water', stylers: [{ color: '#0e1626' }] },
          ],
        });
        // Limpiar marcadores previos
        markersRef.current.forEach(m => m.setMap(null));
        // Filtrar farmacias por búsqueda
        const farmaciasFiltradas = busqueda.trim()
          ? farmacias.filter(f => (f.nombre || f.Nombre || '').toLowerCase().includes(busqueda.toLowerCase()))
          : farmacias;
        // Agregar marcadores
        markersRef.current = farmaciasFiltradas.map(f => {
          const nombreFarmacia = f.nombre || f.Nombre;
          const svgIcon = {
            url: `data:image/svg+xml;utf8,<svg width='44' height='44' viewBox='0 0 44 44' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='22' cy='22' r='22' fill='%2343cea2'/><text x='50%' y='54%' text-anchor='middle' fill='white' font-size='20' font-family='Arial' font-weight='bold' dy='.3em'>F</text></svg>`,
            scaledSize: new window.google.maps.Size(44, 44),
          };
          const marker = new window.google.maps.Marker({
            position: { lat: f.lat, lng: f.lng },
            map: mapRef.current,
            title: nombreFarmacia,
            icon: svgIcon,
            optimized: true,
          });
          // InfoWindow solo al hacer clic
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style='font-weight:700;font-size:16px;color:#185a9d;text-align:center;min-width:120px;'>${nombreFarmacia}</div>`
          });
          marker.addListener('click', () => {
            setSelectedFarmacia(f);
            infoWindow.open(mapRef.current, marker);
          });
          return marker;
        });
        setMapLoaded(true);
      } catch (e) {
        setError('Error al inicializar el mapa. Revisa la consola para más detalles.');
      }
    }
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDfWcGxl9CqPWxHIuoBI-8FE9sJDF9mE60&callback=initMap';
      script.async = true;
      script.onerror = () => setError('No se pudo cargar Google Maps. Revisa tu API key o conexión.');
      window.initMap = renderMap;
      document.body.appendChild(script);
    } else {
      renderMap();
    }
    // Limpieza
    return () => {
      markersRef.current.forEach(m => m.setMap(null));
    };
  }, [farmacias, busqueda]);

  // Centrar en la farmacia más cercana
  const centrarEnCercana = () => {
    if (!navigator.geolocation || !farmacias.length || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      // Buscar la farmacia más cercana
      let minDist = Infinity;
      let farmaciaCercana: Farmacia | null = null;
      farmacias.forEach(f => {
        const dist = Math.sqrt(Math.pow(f.lat - latitude, 2) + Math.pow(f.lng - longitude, 2));
        if (dist < minDist) {
          minDist = dist;
          farmaciaCercana = f;
        }
      });
      if (farmaciaCercana) {
        const f = farmaciaCercana as Farmacia;
        mapRef.current.setCenter({ lat: f.lat, lng: f.lng });
        mapRef.current.setZoom(16);
      }
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mapa de Farmacias</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen scrollY={false} style={{ padding: 0, margin: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
        {/* Barra superior flotante */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 100,
          background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
          boxShadow: '0 4px 16px #0004',
          padding: '14px 0 8px 0',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 20, letterSpacing: 1, textShadow: '0 2px 8px #0006' }}>
            🏥 Mapa de Farmacias
          </span>
        </div>
        {error && (
          <div style={{ position: 'absolute', top: 80, left: 0, width: '100%', zIndex: 100, color: 'white', background: 'rgba(200,0,0,0.9)', padding: 16, textAlign: 'center', fontWeight: 'bold', borderRadius: 8 }}>
            {error}
          </div>
        )}
        {/* Buscador moderno y sugerencias */}
        <div style={{
          position: 'absolute', top: 54, left: 0, width: '100%', zIndex: 90,
          display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto',
        }}>
          <IonInput
            style={{
              maxWidth: 420,
              width: '90%',
              background: 'rgba(255,255,255,0.97)',
              borderRadius: 16,
              boxShadow: '0 4px 16px #43cea2',
              padding: 14,
              fontSize: 18,
              fontWeight: 500,
              border: '2px solid #43cea2',
              color: '#222',
              caretColor: '#222',
              outline: 'none',
            }}
            placeholder="🔍 Buscar farmacia por nombre..."
            value={busqueda}
            onIonInput={e => setBusqueda(e.detail.value!)}
            clearInput
          />
          {/* Sugerencias de farmacias */}
          {busqueda.trim() && (
            <div style={{
              maxWidth: 420,
              width: '90%',
              background: 'rgba(255,255,255,0.98)',
              borderRadius: 12,
              boxShadow: '0 4px 16px #43cea2',
              marginTop: 4,
              padding: '6px 0',
              fontSize: 16,
              fontWeight: 500,
              border: '1.5px solid #43cea2',
              zIndex: 100,
            }}>
              {farmacias.filter(f => (f.nombre || f.Nombre || '').toLowerCase().includes(busqueda.toLowerCase())).slice(0, 6).map(f => (
                <div
                  key={f.id}
                  style={{
                    padding: '8px 18px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    color: '#185a9d',
                    background: selectedFarmacia?.id === f.id ? 'rgba(67,206,162,0.15)' : 'transparent',
                    fontWeight: selectedFarmacia?.id === f.id ? 700 : 500,
                    transition: 'background 0.15s',
                  }}
                  onClick={() => {
                    setSelectedFarmacia(f);
                    if (mapRef.current) {
                      mapRef.current.setCenter({ lat: f.lat, lng: f.lng });
                      mapRef.current.setZoom(16);
                    }
                  }}
                >
                  {f.nombre || f.Nombre}
                </div>
              ))}
              {farmacias.filter(f => (f.nombre || f.Nombre || '').toLowerCase().includes(busqueda.toLowerCase())).length === 0 && (
                <div style={{ padding: '8px 18px', color: '#999' }}>
                  No se encontraron farmacias
                </div>
              )}
            </div>
          )}
        </div>
        {/* Mapa */}
        <div id="map" style={{
          width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1,
          borderRadius: 0,
          boxShadow: '0 2px 12px #0002',
        }}></div>
        {/* Botón farmacia más cercana */}
        {mapLoaded && (
          <IonButton
            style={{
              position: 'fixed', right: 24, bottom: 32, zIndex: 120,
              borderRadius: '50%', width: 66, height: 66,
              boxShadow: '0 8px 24px #43cea2',
              background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700,
              fontSize: 30,
              border: 'none',
              transition: 'box-shadow 0.2s',
              outline: 'none',
            }}
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 12px 32px #43cea2')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = '0 8px 24px #43cea2')}
            onClick={centrarEnCercana}
          >
            <span role="img" aria-label="cerca" style={{ fontSize: 32 }}>📍</span>
          </IonButton>
        )}
        {/* Panel inferior con info de farmacia seleccionada */}
        {selectedFarmacia && (
          <div style={{
            position: 'fixed', left: 0, bottom: 0, width: '100%', zIndex: 130,
            background: 'rgba(255,255,255,0.98)',
            boxShadow: '0 -4px 18px #43cea2',
            borderTopLeftRadius: 22, borderTopRightRadius: 22,
            padding: '22px 28px 18px 28px',
            display: 'flex', flexDirection: 'column', gap: 10,
            fontFamily: 'inherit',
            animation: 'slideUp 0.3s',
          }}>
            <div style={{ fontWeight: 800, fontSize: 23, color: '#185a9d', letterSpacing: 0.5, marginBottom: 2, textShadow: '0 2px 8px #43cea233' }}>{selectedFarmacia.nombre || selectedFarmacia.Nombre}</div>
            <div style={{ color: '#333', fontSize: 16, fontWeight: 500 }}>{selectedFarmacia.direccion}</div>
            <div style={{ color: '#607d8b', fontSize: 15, marginBottom: 2 }}>
              <b>Horario:</b> {selectedFarmacia.turno?.hora_inicio || '--'} a {selectedFarmacia.turno?.hora_cierre || '--'}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
              <IonButton
                style={{
                  background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                  color: '#fff',
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 19,
                  boxShadow: '0 8px 32px #43cea299',
                  padding: '12px 38px',
                  letterSpacing: 0.5,
                  display: 'flex', alignItems: 'center',
                  border: 'none',
                  outline: 'none',
                  minWidth: 180,
                  marginBottom: 8,
                  transition: 'box-shadow 0.2s',
                }}
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFarmacia.lat},${selectedFarmacia.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🚗 Cómo llegar
              </IonButton>
              <IonButton
                style={{
                  background: 'linear-gradient(90deg, #185a9d 0%, #43cea2 100%)',
                  color: '#fff',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 4px 16px #185a9d44',
                  padding: '10px 24px',
                  border: 'none',
                  outline: 'none',
                  minWidth: 150,
                  transition: 'box-shadow 0.2s',
                }}
                href={`https://www.google.com/maps/search/?api=1&query=${selectedFarmacia.lat},${selectedFarmacia.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver en Google Maps
              </IonButton>
              <IonButton
                style={{
                  background: '#eee', color: '#185a9d', borderRadius: '50%', fontWeight: 700, fontSize: 18,
                  boxShadow: '0 2px 8px #0002', width: 40, height: 40, minWidth: 40, minHeight: 40, padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onClick={() => setSelectedFarmacia(null)}
              >
                <span style={{ fontSize: 22, fontWeight: 700 }}>✕</span>
              </IonButton>
            </div>
          </div>
        )}
        {/* Animación panel inferior */}
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};
