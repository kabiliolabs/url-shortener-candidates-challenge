import "react-router";

declare module "react-router" {
  interface AppLoadContext {
    /** Dirección del cliente conectado directamente al servidor, si está disponible. */
    clientIp?: string;
  }
}
