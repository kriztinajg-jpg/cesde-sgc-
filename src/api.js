import { useEffect, useState } from "react";

// Dirección del backend (Spring Boot)
const API = "http://localhost:8080";

// Hook sencillo: pide datos a la API y devuelve { data, loading, error }
export function useApi(path) {
  const [estado, setEstado] = useState({ data: null, loading: true, error: false });

  useEffect(() => {
    let activo = true;
    setEstado({ data: null, loading: true, error: false });
    fetch(API + path)
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then((data) => activo && setEstado({ data, loading: false, error: false }))
      .catch(() => activo && setEstado({ data: null, loading: false, error: true }));
    return () => {
      activo = false;
    };
  }, [path]);

  return estado;
}
