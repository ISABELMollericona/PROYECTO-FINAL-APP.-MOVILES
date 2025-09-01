import { ModalMapa } from '../components/ModalMapa';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonBadge } from '@ionic/react';
import { businessOutline, pricetagOutline, cubeOutline, mapOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
// Para llamada a OpenAI
const OPENAI_API_KEY = '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'; // Reemplaza por tu key real o pásala por variable de entorno
import { useLocation } from 'react-router-dom';
// import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
// import { db } from '../services/firebase';

// Normaliza un id: elimina todo excepto dígitos
function normalizaId(id: any) {
  if (id === undefined || id === null) return '';
  return String(id).replace(/\D/g, '');
}

export const DisponibilidadProducto: React.FC = () => {
  const location = useLocation();
  const producto = (location.state as any)?.producto;
  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [farmaciaMapa, setFarmaciaMapa] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  // Sugerencias IA
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      setLoading(true);
      setSugerencias([]);
      setErrorIA(null);
      if (!producto) {
        setLoading(false);
        return;
      }
      const res = await fetch('http://localhost:4000/farmacia_productos');
      const items = await res.json();
      // Buscar coincidencias de producto (comparar como string exacto)
      // Adaptar a la estructura real: id_producto y id_farmacia
      const disponibles = items.filter((fp: any) => {
        const prodIdStr = String(fp.id_producto).trim();
        return (
          [producto.id, producto.objectID]
            .filter(Boolean)
            .map(String)
            .some(pid => pid.trim() === prodIdStr)
          && fp.stock > 0
        );
      });
      // Obtener info de farmacia y mostrar nombre
      const farmaciasRes = await fetch('http://localhost:4000/farmacias');
      const farmaciasAll = await farmaciasRes.json();
      // Filtrar farmacias abiertas y con stock > 0
      const now = new Date();
      const horaActual = now.getHours() + now.getMinutes() / 60;
      const farmaciasData = disponibles.map((fp: any) => {
        let nombre = '';
        let ref = '';
        let lat = null;
        let lng = null;
        let turno = null;
        let abierta = false;
        if (fp.id_farmacia) {
          ref = String(fp.id_farmacia).trim();
          const farmacia = farmaciasAll.find((f: any) =>
            String(f._id) === ref || String(f.id) === ref
          );
          if (farmacia) {
            nombre = farmacia.nombre || farmacia.Nombre || ref;
            lat = farmacia.lat;
            lng = farmacia.lng;
            turno = farmacia.turno;
            if (turno && turno.hora_inicio && turno.hora_cierre) {
              const [hIni, mIni] = turno.hora_inicio.split(":").map(Number);
              const [hFin, mFin] = turno.hora_cierre.split(":").map(Number);
              const horaIni = hIni + mIni / 60;
              const horaFin = hFin + mFin / 60;
              abierta = horaActual >= horaIni && horaActual <= horaFin;
            }
          } else {
            nombre = '(ID: ' + ref + ')';
          }
        }
        return {
          ...fp,
          nombreFarmacia: nombre,
          lat,
          lng,
          abierta,
        };
      })
      .filter((f: any) => f.stock > 0 && f.abierta);
      setFarmacias(farmaciasData);
      setLoading(false);
    };
    fetchDisponibilidad();
  }, [producto]);

  // Llama a OpenAI si no hay farmacias disponibles
  useEffect(() => {
    const fetchSugerencias = async () => {
      if (loading) return;
      if (farmacias.length > 0) return;
      if (!producto) return;
      setLoadingIA(true);
      setErrorIA(null);
      try {
        const prompt = `Sugiere 5 productos farmacéuticos similares a "${producto["Nombre"] || producto["nombre"] || producto[" Nombre"]}" para una farmacia en Bolivia. Solo lista los nombres, separados por punto y coma.`;
        const response = await fetch('https://api.openai.com/v1/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 100,
            temperature: 0.7,
            n: 1,
            stop: ['\n'],
          }),
        });
        if (!response.ok) throw new Error('Error al consultar OpenAI');
        const data = await response.json();
        let sugeridos = data.choices?.[0]?.text || '';
        sugeridos = sugeridos.replace(/^\s*[:\-\d\.\)]*/gm, ''); // limpia numeración
  const lista = sugeridos.split(';').map((s: string) => s.trim()).filter(Boolean);
        setSugerencias(lista);
      } catch (err: any) {
        setErrorIA('No se pudieron obtener sugerencias IA.');
      }
      setLoadingIA(false);
    };
    fetchSugerencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmacias, loading, producto]);

  if (!producto) return <div>No hay información del producto.</div>;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ fontWeight: 700, letterSpacing: 0.5 }}>
            <IonIcon icon={cubeOutline} style={{ marginRight: 10, fontSize: 24, verticalAlign: 'middle' }} />
            Disponibilidad: {producto["Nombre"] || producto[" Nombre"] || producto["nombre"]}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ background: '#f6f8fa' }}>
        <IonList lines="none" style={{ margin: 0, padding: 0 }}>
          {loading && farmacias.length === 0 && (
            <IonItem style={{ borderRadius: 14, margin: 16, boxShadow: '0 2px 12px #0001', background: '#fff', justifyContent: 'center' }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
                <div className="loader" style={{
                  width: 38, height: 38, border: '4px solid #43cea2', borderTop: '4px solid #185a9d', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12
                }} />
                <span style={{ color: '#185a9d', fontWeight: 600, fontSize: 16 }}>Buscando farmacias...</span>
              </div>
            </IonItem>
          )}
          {!loading && farmacias.length === 0 && (
            <>
              <IonItem style={{ borderRadius: 14, margin: 16, boxShadow: '0 2px 12px #0001', background: '#fff' }}>
                <IonLabel color="medium" style={{ textAlign: 'center', width: '100%' }}>
                  <IonIcon icon={businessOutline} style={{ marginRight: 8, color: '#b0b0b0', fontSize: 22, verticalAlign: 'middle' }} />
                  No disponible en farmacias.
                </IonLabel>
              </IonItem>
              {/* Sugerencias IA */}
              <div style={{ margin: '24px 16px 0 16px', padding: 0 }}>
                {loadingIA && (
                  <div style={{ textAlign: 'center', color: '#185a9d', fontWeight: 600, fontSize: 16, margin: '16px 0' }}>
                    <span className="loader" style={{ width: 28, height: 28, border: '3px solid #43cea2', borderTop: '3px solid #185a9d', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 10 }} />
                    Buscando sugerencias IA...
                  </div>
                )}
                {errorIA && (
                  <div style={{ color: '#e74c3c', textAlign: 'center', margin: '12px 0' }}>{errorIA}</div>
                )}
                {!loadingIA && sugerencias.length > 0 && (
                  <>
                    <div style={{ color: '#185a9d', fontWeight: 700, fontSize: 17, marginBottom: 10, textAlign: 'center' }}>
                      ¿Buscas algo similar?
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                      {sugerencias.map((sug, idx) => (
                        <button
                          key={idx}
                          style={{
                            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '10px 18px',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px #185a9d22',
                            marginBottom: 6,
                          }}
                          onClick={() => {
                            // Nueva búsqueda con el producto sugerido
                            window.location.replace(`/disponibilidad?producto=${encodeURIComponent(sug)}`);
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
          {farmacias.map((f, i) => (
            <IonItem key={i} style={{
              borderRadius: 16,
              margin: '16px 12px',
              boxShadow: '0 4px 18px #0002',
              background: '#fff',
              borderLeft: f.stock > 0 ? '6px solid #43cea2' : '6px solid #e74c3c',
              transition: 'box-shadow 0.2s',
              alignItems: 'flex-start',
            }}>
              <IonIcon icon={businessOutline} slot="start" style={{ fontSize: 28, color: '#185a9d', marginRight: 12, marginTop: 8 }} />
              <IonLabel style={{ fontSize: 17, fontWeight: 500, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#185a9d', fontWeight: 700 }}>{f.nombreFarmacia}</span>
                  {f.lat && f.lng && (
                    <button
                      title="Ver en mapa"
                      style={{
                        background: 'none',
                        border: 'none',
                        marginLeft: 8,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={() => {
                        setFarmaciaMapa(f);
                        setModalOpen(true);
                      }}
                    >
                      <IonIcon
                        icon={mapOutline}
                        style={{
                          fontSize: 28,
                          color: '#185a9d',
                          background: '#fff',
                          borderRadius: 6,
                          boxShadow: '0 2px 8px #185a9d33',
                          padding: 2,
                        }}
                      />
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 6, fontSize: 15, color: '#444' }}>
                  <IonIcon icon={pricetagOutline} style={{ fontSize: 18, color: '#43cea2', marginRight: 6, verticalAlign: 'middle' }} />
                  <b>Precio:</b> {f.precio} Bs
                  <IonBadge color={f.stock > 0 ? 'success' : 'danger'} style={{ marginLeft: 16, fontSize: 14, verticalAlign: 'middle' }}>
                    <IonIcon icon={cubeOutline} style={{ fontSize: 16, marginRight: 3, verticalAlign: 'middle' }} />
                    Stock: {f.stock}
                  </IonBadge>
                </div>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        {/* Modal de mapa para farmacia seleccionada */}
        {farmaciaMapa && farmaciaMapa.lat && farmaciaMapa.lng && (
          <ModalMapa
            isOpen={modalOpen}
            onDidDismiss={() => setModalOpen(false)}
            lat={farmaciaMapa.lat}
            lng={farmaciaMapa.lng}
            nombre={farmaciaMapa.nombreFarmacia}
          />
        )}
      </IonContent>
    </IonPage>
  );
};
