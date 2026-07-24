// Maps raw axios/network failures to user-facing Spanish copy; the technical detail stays in console.error.
export const getFriendlyErrorMessage = (err: unknown, fallback: string): string => {
  const anyErr = err as { code?: string; message?: string; response?: { status?: number } } | undefined;

  if (anyErr?.code === 'ERR_NETWORK' || anyErr?.message === 'Network Error') {
    return 'No pudimos conectar con el servidor. Revisa tu conexion e intenta nuevamente.';
  }

  if (anyErr?.code === 'ECONNABORTED') {
    return 'La solicitud tardo demasiado en responder. Intenta nuevamente.';
  }

  const status = anyErr?.response?.status;
  if (status === 401 || status === 403) {
    return 'No tienes permiso para realizar esta accion. Vuelve a iniciar sesion e intenta de nuevo.';
  }
  if (status === 404) {
    return 'No encontramos la informacion solicitada.';
  }
  if (status !== undefined && status >= 500) {
    return 'El servidor tuvo un problema. Intenta nuevamente en unos minutos.';
  }

  return fallback;
};
