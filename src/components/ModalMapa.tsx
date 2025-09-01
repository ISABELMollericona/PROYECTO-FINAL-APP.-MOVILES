import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface ModalMapaProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  lat: number;
  lng: number;
  nombre: string;
}

const containerStyle = {
  width: '100%',
  height: '60vh',
  minHeight: 280,
  maxHeight: 420,
  borderRadius: 18,
  margin: '0 auto',
  boxShadow: '0 8px 32px #0004',
  background: '#fff',
  border: '2px solid #43cea2',
};

export const ModalMapa: React.FC<ModalMapaProps> = ({ isOpen, onDidDismiss, lat, lng, nombre }) => {
  const apiKey = 'AIzaSyDfWcGxl9CqPWxHIuoBI-8FE9sJDF9mE60';
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });
  const center = { lat, lng };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar style={{ background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
          <IonTitle style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontWeight: 700, fontSize: 20 }}>
            {nombre}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ background: '#f8f9fa', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          {apiKey ? (
            isLoaded ? (
              <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={16}>
                <Marker position={center} />
              </GoogleMap>
            ) : (
              <div style={{ color: '#333', fontWeight: 600, fontSize: 18, textAlign: 'center', padding: 32 }}>
                Cargando mapa...
              </div>
            )
          ) : (
            <div style={{ color: '#c00', fontWeight: 600, fontSize: 18, textAlign: 'center', padding: 32 }}>
              No se ha configurado la API key de Google Maps.<br />Agrega VITE_GOOGLE_MAPS_KEY en tu archivo .env.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, marginBottom: 8 }}>
          <IonButton expand="block" color="medium" onClick={onDidDismiss} style={{ fontWeight: 600, borderRadius: 10 }}>
            Salir
          </IonButton>
          <IonButton
            expand="block"
            color="success"
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, borderRadius: 10 }}
          >
            Ver en Google Maps
          </IonButton>
          <IonButton
            expand="block"
            color="primary"
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, borderRadius: 10 }}
          >
            Cómo llegar
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

