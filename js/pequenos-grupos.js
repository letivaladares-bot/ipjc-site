/* ==========================================================================
   IPJC v3 — Pequenos Grupos de Discipulado
   Sem nomes, telefones ou endereços dos grupos (privacidade): os botões
   "Quero participar / saber mais" levam ao WhatsApp da secretaria.
   ========================================================================== */
(function () {
  'use strict';
  var S = window.IPJCSite;
  var D = window.IPJC;

  S.registrarPagina('pequenos-grupos', function () {
    var link = S.linkWhats(D.contato.whatsapp) + '?text=' + encodeURIComponent(
      'Olá! Quero participar de um Pequeno Grupo de Discipulado. Moro no bairro ____ e posso nos dias ____.');
    Array.prototype.forEach.call(document.querySelectorAll('.pg-quero'), function (a) {
      a.href = link; a.target = '_blank'; a.rel = 'noopener';
      a.insertAdjacentHTML('afterbegin', S.icon('whatsapp'));
    });
  });
})();
