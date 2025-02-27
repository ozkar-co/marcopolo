// Registrar el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration.scope);
      })
      .catch(error => {
        console.log('Error al registrar el Service Worker:', error);
      });
  });
}

// Función para mostrar el banner de instalación
let deferredPrompt;
const installButton = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir que Chrome muestre automáticamente el prompt
  e.preventDefault();
  // Guardar el evento para usarlo más tarde
  deferredPrompt = e;
  // Mostrar el botón de instalación si existe
  if (installButton) {
    installButton.style.display = 'block';
  }
});

// Función para manejar el clic en el botón de instalación
if (installButton) {
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();
      // Esperar a que el usuario responda al prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Usuario respondió: ${outcome}`);
      // Limpiar la variable deferredPrompt
      deferredPrompt = null;
      // Ocultar el botón de instalación
      installButton.style.display = 'none';
    }
  });
}

// Detectar cuando la app ha sido instalada
window.addEventListener('appinstalled', (evt) => {
  console.log('MarcoPolo ha sido instalada');
}); 