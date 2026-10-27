/* ==========================================================================
   IPJC v3 — Quero ser membro
   Explica o caminho (classe de catecúmenos) e leva ao formulário de interesse
   (IPJC.membresia.url). Sem formulário configurado, o botão vai para o WhatsApp.
   ========================================================================== */
(function () {
  'use strict';
  var S = window.IPJCSite;
  var D = window.IPJC;

  S.registrarPagina('membro', function () {
    var whats = S.linkWhats(D.contato.whatsapp) + '?text=' + encodeURIComponent('Olá! Gostaria de saber como me tornar membro da IPJC.');
    var form = document.getElementById('mb-form');
    form.href = (D.membresia || {}).url || whats;
    var w = document.getElementById('mb-whats');
    w.href = whats; w.target = '_blank'; w.rel = 'noopener';
    w.insertAdjacentHTML('afterbegin', S.icon('whatsapp'));
  });
})();
