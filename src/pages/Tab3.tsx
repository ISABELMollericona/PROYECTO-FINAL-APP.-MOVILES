import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import { useEffect, useState } from 'react';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../services/firebase';
import { IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import './Tab3.css';


interface Farmacia {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  turno?: {
    hora_inicio: string;
    hora_cierre: string;
  };
}

const Tab3: React.FC = () => {
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);

  useEffect(() => {
    const fetchFarmacias = async () => {
      const res = await fetch('http://localhost:4000/farmacias');
      const data = await res.json();
      setFarmacias(data);
    };
    fetchFarmacias();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Farmacias Disponibles</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          {farmacias.map(f => (
            <IonCard key={f.id}>
              <IonCardHeader>
                <IonCardTitle>{f.nombre}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonLabel>
                  <div><b>Dirección:</b> {f.direccion}</div>
                  {f.turno && (
                    <div><b>Turno:</b> {f.turno.hora_inicio} - {f.turno.hora_cierre}</div>
                  )}
                </IonLabel>
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
