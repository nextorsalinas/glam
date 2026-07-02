const { db } = require('../config/firebase');

let status = 'DISCONNECTED';
let currentQR = '';

function initializeWhatsApp(force = false) {
  console.log('🤖 WhatsApp Bot automático deshabilitado para mejorar estabilidad y rendimiento de la VM.');
  status = 'DISCONNECTED';
  currentQR = '';
}

function getWhatsAppStatus() {
  return { status, qr: currentQR, phone: '' };
}

async function logoutWhatsApp() {
  status = 'DISCONNECTED';
  currentQR = '';
  console.log('🤖 WhatsApp desvinculado del bot automático.');
  return { success: true };
}

module.exports = {
  initializeWhatsApp,
  getWhatsAppStatus,
  logoutWhatsApp
};
