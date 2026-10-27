/* ==========================================================================
   IPJC v3 — Social (ONG Jardins Cultivando Vidas)
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;

  S.registrarPagina('social', function () {
    var ong = D.social;

    /* texto oficial da ONG, quando preenchido */
    if (ong.sobre) {
      document.getElementById('ong-sobre').innerHTML = String(ong.sobre).split(/\n\s*\n/).map(function (p) {
        return '<p>' + esc(p.trim()) + '</p>';
      }).join('');
    }

    /* redes da ONG, quando preenchidas */
    var redes = [];
    if (ong.instagram) redes.push('<a class="soc-rede" href="https://www.instagram.com/' + esc(ong.instagram.replace(/^@/, '')) + '/" target="_blank" rel="noopener">' + S.icon('instagram') + esc(ong.instagram) + '</a>');
    if (ong.telefone) redes.push('<a class="soc-rede" href="' + S.linkWhats(ong.telefone) + '" target="_blank" rel="noopener">' + S.icon('whatsapp') + esc(ong.telefone) + '</a>');
    if (ong.email) redes.push('<a class="soc-rede" href="mailto:' + esc(ong.email) + '">' + S.icon('email') + esc(ong.email) + '</a>');
    document.getElementById('ong-redes').innerHTML = redes.join('');

    S.videoLite(document.getElementById('ong-video'), ong.video, 'Conheça a ' + ong.nome + ' — vídeo institucional');

    var w = document.getElementById('soc-whats');
    w.href = S.linkWhats(ong.telefone || D.contato.whatsapp) + '?text=' + encodeURIComponent('Olá! Vi o site da IPJC e quero saber como posso ajudar a ' + ong.nome + '.');
    w.target = '_blank'; w.rel = 'noopener';
    w.insertAdjacentHTML('afterbegin', S.icon('whatsapp'));
  });
})();
