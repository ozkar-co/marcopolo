/**
 * Script de ayuda para depuración de la PWA MarcoPolo
 * Este script ayuda a identificar y manejar errores comunes durante el desarrollo
 */

// Suprimir mensajes de error no críticos en la consola
const originalConsoleError = console.error;
console.error = function(...args) {
  // Ignorar el error "The message port closed before a response was received"
  if (args[0] && typeof args[0] === 'string' && 
      args[0].includes('The message port closed before a response was received')) {
    // Este es un error común de las extensiones de Chrome, no lo mostramos
    return;
  }
  
  // Ignorar errores de WebSocket durante el desarrollo
  if (args[0] && args[0] instanceof Error && 
      args[0].message && args[0].message.includes('WebSocket')) {
    // Solo registrar en lugar de mostrar como error
    console.log('Nota: Error de WebSocket ignorado durante el desarrollo:', args[0].message);
    return;
  }
  
  // Para todos los demás errores, usar el comportamiento normal
  originalConsoleError.apply(console, args);
};

// Función para verificar si la PWA está instalada
function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Registrar si la PWA está en modo standalone
if (isPWAInstalled()) {
  console.log('La aplicación está ejecutándose como PWA instalada');
} else {
  console.log('La aplicación está ejecutándose en el navegador');
}

// Verificar si el Service Worker está activo
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration()
    .then(registration => {
      if (registration) {
        console.log('Service Worker activo:', registration.active ? 'Sí' : 'No');
        console.log('Estado del Service Worker:', registration.active ? registration.active.state : 'N/A');
      } else {
        console.log('No hay Service Worker registrado');
      }
    });
}

// Verificar el estado de la caché
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    console.log('Cachés disponibles:', cacheNames);
  });
}

// Exponer funciones útiles para depuración en la consola
window.debugPWA = {
  clearCaches: async function() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Todas las cachés han sido eliminadas');
      return true;
    }
    return false;
  },
  
  unregisterServiceWorker: async function() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const success = await registration.unregister();
        console.log('Service Worker desregistrado:', success);
        return success;
      }
      console.log('No hay Service Worker para desregistrar');
      return false;
    }
    return false;
  },
  
  reloadApp: function() {
    window.location.reload();
  },
  
  resetApp: async function() {
    await this.clearCaches();
    await this.unregisterServiceWorker();
    this.reloadApp();
  }
};

console.log('Script de depuración cargado. Usa window.debugPWA para acceder a las herramientas de depuración.'); 