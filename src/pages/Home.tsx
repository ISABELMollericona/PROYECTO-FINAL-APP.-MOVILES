import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList } from '@ionic/react';
import { useEffect, useState } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../services/firebase';
import { FarmaciaCard } from '../components/FarmaciaCard';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { ModalMapa } from '../components/ModalMapa';

interface Farmacia {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  lat?: number;
  lng?: number;
  turno?: {
    hora_inicio?: string;
    hora_cierre?: string;
  };
}



const Home: React.FC = () => {
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [farmaciaMapa, setFarmaciaMapa] = useState<Farmacia | null>(null);

  // Google Maps API Key (pon tu key en .env y usa import.meta.env.VITE_GOOGLE_MAPS_KEY)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDfWcGxl9CqPWxHIuoBI-8FE9sJDF9mE60',
  });

  useEffect(() => {
    const fetchFarmacias = async () => {
      const res = await fetch('http://localhost:4000/farmacias');
      const allFarmacias = await res.json();
      const now = new Date();
      const horaActual = now.getHours() + now.getMinutes() / 60;
      const data = allFarmacias
        .filter((f: Farmacia) => {
          if (!f.turno || !f.turno.hora_inicio || !f.turno.hora_cierre) return false;
          const [hIni, mIni] = f.turno.hora_inicio.split(":").map(Number);
          const [hFin, mFin] = f.turno.hora_cierre.split(":").map(Number);
          const horaIni = hIni + mIni / 60;
          const horaFin = hFin + mFin / 60;
          return horaActual >= horaIni && horaActual <= horaFin;
        });
      setFarmacias(data);
    };
    fetchFarmacias();
  }, []);

  // Centrar el mapa en la primera farmacia disponible, o una ubicación por defecto
  const defaultCenter = farmacias.length > 0 && farmacias[0].lat && farmacias[0].lng
    ? { lat: farmacias[0].lat, lng: farmacias[0].lng }
    : { lat: -17.7833, lng: -63.1821 }; // Santa Cruz, Bolivia


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', boxShadow: '0 4px 18px #43cea244' }}>
          <IonTitle style={{ fontWeight: 900, letterSpacing: 1.5, fontSize: 28, color: '#fff', textShadow: '0 2px 12px #185a9d55', padding: '14px 0' }}>
            <span role="img" aria-label="farmacia" style={{ fontSize: 32, marginRight: 10 }}>💊</span>
            Farmacias de Turno
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{
        background: 'linear-gradient(135deg, #f6f8fa 0%, #43cea2 100%)',
        minHeight: '100vh',
        padding: 0
      }}>
        <IonList style={{
          margin: 0,
          padding: 0,
          background: 'transparent',
        }}>
          {farmacias.map(f => (
            <div key={f.id} style={{
              background: 'rgba(255,255,255,0.98)',
              borderRadius: 22,
              margin: '22px 18px',
              boxShadow: '0 8px 32px #43cea244',
              padding: 26,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: '2px solid #43cea244',
              position: 'relative',
              transition: 'transform 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.025)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 900, fontSize: 23, color: '#185a9d', letterSpacing: 1, textShadow: '0 2px 8px #43cea233' }}>
                  <span role="img" aria-label="farmacia" style={{ fontSize: 22, marginRight: 8 }}>🏥</span>
                  {f.nombre}
                </span>
                {/* Icono de Google Maps eliminado */}
              </div>
              <div style={{ color: '#43cea2', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span role="img" aria-label="ubicación" style={{ fontSize: 18 }}>📍</span>
                {f.direccion}
              </div>
              <div style={{ color: '#185a9d', fontSize: 15, fontWeight: 500, marginBottom: 2 }}>
                <span role="img" aria-label="horario" style={{ fontSize: 16, marginRight: 6 }}>⏰</span>
                <b>Horario:</b> {f.turno?.hora_inicio || '--'} a {f.turno?.hora_cierre || '--'}
              </div>
              <button
                style={{
                  marginTop: 14,
                  alignSelf: 'center',
                  background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px 32px',
                  fontWeight: 700,
                  fontSize: 17,
                  boxShadow: '0 4px 16px #43cea244',
                  cursor: 'pointer',
                  letterSpacing: 0.5,
                  transition: 'background 0.2s',
                  outline: 'none',
                }}
                onClick={() => {
                  if (f.lat && f.lng) {
                    setFarmaciaMapa(f);
                    setModalOpen(true);
                  } else {
                    alert('Ubicación no disponible');
                  }
                }}
              >
                <span role="img" aria-label="mapa" style={{ fontSize: 20, marginRight: 8 }}>🗺️</span>
                Ver en mapa
              </button>
            </div>
          ))}
        </IonList>
        {farmaciaMapa && farmaciaMapa.lat && farmaciaMapa.lng && (
          <ModalMapa
            isOpen={modalOpen}
            onDidDismiss={() => setModalOpen(false)}
            lat={farmaciaMapa.lat}
            lng={farmaciaMapa.lng}
            nombre={farmaciaMapa.nombre}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
