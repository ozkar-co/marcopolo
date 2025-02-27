// Registrar el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration.scope);
        
        // Verificar si hay actualizaciones del Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Nuevo Service Worker instalándose:', newWorker);
          
          newWorker.addEventListener('statechange', () => {
            console.log('Estado del Service Worker:', newWorker.state);
            
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              // Notificar al usuario que hay una actualización disponible
              console.log('Nueva versión disponible. Recargar para actualizar.');
            }
          });
        });
      })
      .catch(error => {
        console.log('Error al registrar el Service Worker:', error);
      });
  });
  
  // Manejar actualizaciones del Service Worker
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('Service Worker actualizado, recargando la página...');
      window.location.reload();
    }
  });
}

// Variables para el manejo de la instalación
let deferredPrompt;
let installButton;

// Función para mostrar el botón de instalación
function showInstallButton() {
  installButton = document.getElementById('install-button');
  if (installButton) {
    installButton.style.display = 'block';
    console.log('Botón de instalación mostrado');
    
    // Asegurarse de que el evento click esté configurado
    installButton.addEventListener('click', installApp);
  } else {
    console.log('Botón de instalación no encontrado');
    // Intentar encontrar el botón después de que el DOM esté completamente cargado
    window.addEventListener('DOMContentLoaded', () => {
      installButton = document.getElementById('install-button');
      if (installButton) {
        installButton.style.display = 'block';
        console.log('Botón de instalación encontrado y mostrado después de cargar el DOM');
        installButton.addEventListener('click', installApp);
      }
    });
  }
}

// Función para instalar la aplicación
async function installApp() {
  if (!deferredPrompt) {
    console.log('No hay prompt de instalación disponible');
    return;
  }
  
  // Mostrar el prompt de instalación
  deferredPrompt.prompt();
  console.log('Prompt de instalación mostrado');
  
  // Esperar a que el usuario responda al prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Usuario respondió: ${outcome}`);
  
  // Limpiar la variable deferredPrompt
  deferredPrompt = null;
  
  // Ocultar el botón de instalación
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Capturar el evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir que Chrome muestre automáticamente el prompt
  e.preventDefault();
  // Guardar el evento para usarlo más tarde
  deferredPrompt = e;
  console.log('Evento beforeinstallprompt capturado');
  
  // Mostrar el botón de instalación
  showInstallButton();
});

// Detectar cuando la app ha sido instalada
window.addEventListener('appinstalled', (evt) => {
  console.log('MarcoPolo ha sido instalada');
  // Ocultar el botón de instalación si está visible
  if (installButton) {
    installButton.style.display = 'none';
  }
}); 