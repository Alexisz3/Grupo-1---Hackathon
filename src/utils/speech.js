export const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// El micrófono del navegador solo funciona en localhost o con HTTPS
export const canDictate = Boolean(Recognition) && window.isSecureContext;
