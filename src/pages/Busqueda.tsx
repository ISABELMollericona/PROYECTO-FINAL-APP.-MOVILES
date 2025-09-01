import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
// Para llamada a OpenAI
const OPENAI_API_KEY = 'AQUÍ_TU_API_KEY'; // Reemplaza por tu key real o pásala por variable de entorno
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../services/firebase';

export const Busqueda: React.FC = () => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState<string | null>(null);
  const history = useHistory();

  const handleSearch = async (text: string) => {
    setQuery(text);
    setErrorIA(null);
    setSugerencias([]);
    if (text.length > 2) {
      const res = await fetch(`http://localhost:4000/buscar_productos?q=${encodeURIComponent(text)}`);
      const productos = await res.json();
      setResultados(productos);
      // Si no hay resultados, pedir sugerencias IA
      if (productos.length === 0) {
        setLoadingIA(true);
        try {
          const prompt = `Sugiere 5 medicamentos o productos farmacéuticos similares a "${text}" para una farmacia en Bolivia. Solo lista los nombres, separados por punto y coma.`;
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
          sugeridos = sugeridos.replace(/^\s*[:\-\d\.\)]*/gm, '');
          const lista = sugeridos.split(';').map((s: string) => s.trim()).filter(Boolean);
          setSugerencias(lista);
        } catch (err: any) {
          setErrorIA('No se pudieron obtener sugerencias IA.');
        }
        setLoadingIA(false);
      }
    } else {
      setResultados([]);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)', boxShadow: '0 4px 18px #43cea244' }}>
          <IonTitle style={{ fontWeight: 900, letterSpacing: 1.5, fontSize: 26, color: '#fff', textShadow: '0 2px 12px #185a9d55', padding: '14px 0' }}>
            <span role="img" aria-label="medicamento" style={{ fontSize: 28, marginRight: 10 }}>🔎</span>
            Buscar Medicamento
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{
        background: 'linear-gradient(135deg, #f6f8fa 0%, #43cea2 100%)',
        minHeight: '100vh',
        padding: 0
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 0 12px 0',
        }}>
          <IonInput
            value={query}
            placeholder="🔍 Escriba el medicamento..."
            onIonInput={e => handleSearch(e.detail.value!)}
            style={{
              maxWidth: 440,
              width: '90%',
              background: 'rgba(255,255,255,0.98)',
              borderRadius: 16,
              boxShadow: '0 4px 16px #43cea244',
              padding: 16,
              fontSize: 18,
              fontWeight: 600,
              border: '2px solid #43cea244',
              color: '#185a9d',
              caretColor: '#185a9d',
              outline: 'none',
            }}
            clearInput
          />
        </div>
  <IonList style={{ background: 'transparent', margin: 0, padding: 0 }}>
          {resultados.length === 0 && query.length > 2 && (
            <div style={{
              background: 'rgba(255,255,255,0.98)',
              borderRadius: 20,
              margin: '28px 18px',
              boxShadow: '0 8px 32px #43cea244',
              padding: 28,
              border: '2px solid #43cea244',
              textAlign: 'center',
              color: '#185a9d',
              fontWeight: 700,
              fontSize: 18,
            }}>
              No se encontró ningún producto con ese nombre.<br />
              {loadingIA && (
                <div style={{ color: '#185a9d', fontWeight: 600, fontSize: 15, marginTop: 10 }}>
                  <span className="loader" style={{ width: 24, height: 24, border: '3px solid #43cea2', borderTop: '3px solid #185a9d', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8 }} />
                  Buscando sugerencias IA...
                </div>
              )}
              {errorIA && (
                <div style={{ color: '#e74c3c', marginTop: 10 }}>{errorIA}</div>
              )}
              {!loadingIA && sugerencias.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ color: '#43cea2', fontWeight: 800, fontSize: 17, marginBottom: 8 }}>
                    ¿Buscas algo similar?
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                    {sugerencias.map((sug, idx) => (
                      <button
                        key={idx}
                        style={{
                          background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 12,
                          padding: '10px 22px',
                          fontWeight: 700,
                          fontSize: 16,
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px #43cea244',
                          marginBottom: 8,
                          letterSpacing: 0.5,
                        }}
                        onClick={() => handleSearch(sug)}
                      >
                        <span role="img" aria-label="med" style={{ fontSize: 17, marginRight: 7 }}>💊</span>
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {resultados.map((med, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.98)',
              borderRadius: 20,
              margin: '22px 18px',
              boxShadow: '0 8px 32px #43cea244',
              padding: 26,
              border: '2px solid #43cea244',
              transition: 'transform 0.15s',
              position: 'relative',
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.025)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ fontWeight: 800, fontSize: 21, color: '#185a9d', marginBottom: 4, letterSpacing: 0.5, textShadow: '0 2px 8px #43cea233' }}>
                <span role="img" aria-label="med" style={{ fontSize: 19, marginRight: 7 }}>💊</span>
                {med["Nombre"] || med[" Nombre"] || med["nombre"]}
              </div>
              <div style={{ color: '#43cea2', fontSize: 15, marginBottom: 2 }}><b>Código Barras:</b> {med["Codigo_Barras"] || med[" Código_Barras"] || med["codigo_barras"]}</div>
              <div style={{ color: '#185a9d', fontSize: 15, marginBottom: 2 }}><b>Marca:</b> {med["Marca"] || med[" Marca"] || med["marca"]}</div>
              <div style={{ color: '#43cea2', fontSize: 15, marginBottom: 2 }}><b>Acción Terapéutica:</b> {med["Acción_Terapéutica"] || med[" Acción _ Terapéutica"] || med["accion_terapeutica"]}</div>
              <div style={{ color: '#185a9d', fontSize: 15, marginBottom: 2 }}><b>Principio Activo:</b> {med["Principio_Activo"] || med[" Principio_Activo"] || med["principio_activo"]}</div>
              <div style={{ color: '#43cea2', fontSize: 15, marginBottom: 2 }}><b>Identificación:</b> {med["identificación"] || med[" Identificación"] || med["identificacion"]}</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <IonButton
                  style={{
                    background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                    color: '#fff',
                    borderRadius: 14,
                    fontWeight: 700,
                    fontSize: 17,
                    boxShadow: '0 4px 16px #43cea244',
                    padding: '12px 32px',
                    letterSpacing: 0.5,
                    outline: 'none',
                  }}
                  fill="solid"
                  size="large"
                  onClick={() => history.push('/disponibilidad-producto', { producto: med })}
                >
                  <span role="img" aria-label="farmacia" style={{ fontSize: 20, marginRight: 8 }}>🏥</span>
                  Ver disponibilidad en farmacias
                </IonButton>
              </div>
            </div>
          ))}
        </IonList>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};
