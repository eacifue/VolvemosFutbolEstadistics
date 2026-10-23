// Traduce fallos de red/HTTP a copy en español (qué pasó + qué hacer); el detalle técnico queda en console.error.
export const getFriendlyErrorMessage = (err: unknown, fallback: string): string => {
  const anyErr = err as { code?: string; message?: string; response?: { status?: number } } | undefined;

  if (anyErr?.code === 'ERR_NETWORK' || anyErr?.message === 'Network Error') {
    return 'No pudimos conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.';
  }

  if (anyErr?.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder. Vuelve a intentarlo.';
  }

  const status = anyErr?.response?.status;
  if (status === 401 || status === 403) {
    return 'Tu sesión de admin venció. Vuelve a entrar e inténtalo de nuevo.';
  }
  if (status === 404) {
    return 'No encontramos lo que buscabas. Puede que alguien lo haya borrado.';
  }
  if (status !== undefined && status >= 500) {
    return 'Se nos cayó el balón en el servidor. Inténtalo en unos minutos.';
  }

  return fallback;
};
