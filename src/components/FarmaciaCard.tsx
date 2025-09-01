import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/react';

interface FarmaciaCardProps {
  nombre: string;
  direccion: string;
  telefono: string;
  onVerMapa: () => void;
}

export const FarmaciaCard: React.FC<FarmaciaCardProps> = ({ nombre, direccion, telefono, onVerMapa }) => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{nombre}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p>{direccion}</p>
        <p>{telefono}</p>
        <IonButton onClick={onVerMapa}>Ver en Mapa</IonButton>
      </IonCardContent>
    </IonCard>
  );
};
