interface RateLimitWindow {
  /** Intentos consumidos durante la ventana actual. */
  count: number;
  /** Marca de tiempo en la que la ventana deja de ser válida. */
  resetAt: number;
}

export interface RateLimitDecision {
  /** Indica si el cliente puede continuar con el intento. */
  allowed: boolean;
  /** Segundos restantes hasta poder volver a intentar cuando se alcanza el límite. */
  retryAfterSeconds: number;
}

/** Limitador de ventana fija almacenado en memoria para una sola instancia del servidor. */
export class InMemoryRateLimiter {
  private readonly windows = new Map<string, RateLimitWindow>();

  /**
   * @param maxAttempts Intentos permitidos por cliente en cada ventana.
   * @param windowMs Duración de la ventana en milisegundos.
   * @param maxTrackedClients Máximo de clientes conservados antes de desalojar el más antiguo.
   */
  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number,
    private readonly maxTrackedClients = 10_000,
  ) {
    if (
      !Number.isSafeInteger(maxAttempts) ||
      maxAttempts < 1 ||
      !Number.isSafeInteger(windowMs) ||
      windowMs < 1 ||
      !Number.isSafeInteger(maxTrackedClients) ||
      maxTrackedClients < 1
    ) {
      throw new RangeError("Rate limiter settings must be positive integers.");
    }
  }

  /**
   * Consume un intento y devuelve el tiempo de espera si se excedió el límite.
   * `now` permite probar el comportamiento con un reloj controlado.
   */
  consume(clientIp: string, now = Date.now()): RateLimitDecision {
    const key = clientIp.trim().toLowerCase().replace(/^::ffff:/, "") || "unknown";
    let window = this.windows.get(key);

    if (window && window.resetAt <= now) {
      this.windows.delete(key);
      window = undefined;
    }

    if (!window) {
      this.removeExpiredWindows(now);

      if (this.windows.size >= this.maxTrackedClients) {
        this.removeOldestWindow();
      }

      window = { count: 0, resetAt: now + this.windowMs };
    }

    this.windows.delete(key);
    this.windows.set(key, window);

    if (window.count >= this.maxAttempts) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((window.resetAt - now) / 1000),
        ),
      };
    }

    window.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  /** Elimina ventanas vencidas para liberar espacio en el mapa. */
  private removeExpiredWindows(now: number) {
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) {
        this.windows.delete(key);
      }
    }
  }

  /** Desaloja el cliente menos recientemente actualizado al alcanzar la capacidad. */
  private removeOldestWindow() {
    const oldestKey = this.windows.keys().next().value;
    if (oldestKey !== undefined) {
      this.windows.delete(oldestKey);
    }
  }
}

export const creationRateLimiter = new InMemoryRateLimiter(10, 60_000);
