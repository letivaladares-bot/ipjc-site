/* ==========================================================================
   IPJC v3 — Dízimos e ofertas
   Abas por destino (sede e congregações), copiar chave / Pix copia e cola,
   QR Code ampliado e dados bancários. Dados em IPJC.contribuicao.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;

  function copiar(texto, botao) {
    var rotulo = botao.querySelector('.rotulo');
    var original = rotulo.textContent;
    function ok() {
      botao.classList.add('is-copiado'); rotulo.textContent = 'Copiado!';
      setTimeout(function () { botao.classList.remove('is-copiado'); rotulo.textContent = original; }, 2200);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(ok, function () { window.prompt('Copie:', texto); });
    else window.prompt('Copie:', texto);
  }

  S.registrarPagina('contribua', function () {
    var itens = D.contribuicao || [];
    var abas = document.getElementById('cb-abas');
    var paineis = document.getElementById('cb-paineis');

    abas.innerHTML = itens.map(function (c, i) {
      return '<button class="aba" role="tab" type="button" id="cb-aba-' + c.id + '" aria-controls="cb-painel-' + c.id + '" aria-selected="' + (i === 0) + '"' + (i ? ' tabindex="-1"' : '') + '>' + esc(c.aba) + '</button>';
    }).join('');

    paineis.innerHTML = itens.map(function (c, i) {
      return '<div class="cb-painel" role="tabpanel" id="cb-painel-' + c.id + '" aria-labelledby="cb-aba-' + c.id + '"' + (i ? ' hidden' : '') + '>' +
        '<div class="cb-qr">' +
          '<button class="cb-qr-btn" type="button" data-qr="' + i + '" aria-label="Ampliar QR Code Pix — ' + esc(c.destino) + '">' +
            '<img src="' + esc(c.qr) + '" alt="QR Code Pix — ' + esc(c.destino) + '" width="200" height="200">' +
            '<span>Toque para ampliar</span></button>' +
        '</div>' +
        '<div class="cb-info">' +
          '<p class="eyebrow">' + esc(c.titulo) + '</p>' +
          '<h2>' + esc(c.destino) + '</h2>' +
          '<div class="cb-chave">' +
            '<span class="cb-chave-tipo">Chave ' + esc(c.tipoChave) + '</span>' +
            '<span class="cb-chave-valor">' + esc(c.chave) + '</span>' +
          '</div>' +
          '<div class="cb-botoes">' +
            '<button class="btn" type="button" data-copiar="chave" data-i="' + i + '">' + S.icon('diagonal') + '<span class="rotulo">Copiar chave</span></button>' +
            (c.pixCopiaECola ? '<button class="btn btn--ghost" type="button" data-copiar="pix" data-i="' + i + '"><span class="rotulo">Pix copia e cola</span></button>' : '') +
          '</div>' +
          '<dl class="cb-banco">' +
            '<div><dt>Favorecido</dt><dd>' + esc(c.titular) + '</dd></div>' +
            c.banco.map(function (b) { return '<div><dt>' + esc(b[0]) + '</dt><dd>' + esc(b[1]) + '</dd></div>'; }).join('') +
          '</dl>' +
        '</div>' +
      '</div>';
    }).join('');

    /* abas */
    var botoes = Array.prototype.slice.call(abas.children);
    function ativar(b, foco) {
      botoes.forEach(function (x) {
        var sel = x === b;
        x.setAttribute('aria-selected', String(sel)); x.tabIndex = sel ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !sel;
      });
      if (foco) b.focus();
    }
    botoes.forEach(function (b, i) {
      b.addEventListener('click', function () { ativar(b); });
      b.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? (i + 1) % botoes.length : e.key === 'ArrowLeft' ? (i - 1 + botoes.length) % botoes.length : null;
        if (n !== null) { e.preventDefault(); ativar(botoes[n], true); }
      });
    });
    /* #chacara / #santa abrem direto a aba */
    var inicial = document.getElementById('cb-aba-' + location.hash.slice(1));
    if (inicial) ativar(inicial);

    /* copiar */
    paineis.addEventListener('click', function (e) {
      var b = e.target.closest('[data-copiar]');
      if (b) {
        var c = itens[+b.getAttribute('data-i')];
        copiar(b.getAttribute('data-copiar') === 'pix' ? c.pixCopiaECola : c.chaveCopia, b);
        return;
      }
      var q = e.target.closest('[data-qr]');
      if (q) abrirQR(itens[+q.getAttribute('data-qr')], q);
    });

    /* QR ampliado */
    var modal = document.getElementById('cb-modal');
    var origem = null;
    function abrirQR(c, botao) {
      origem = botao;
      document.getElementById('cb-modal-img').src = c.qr;
      document.getElementById('cb-modal-img').alt = 'QR Code Pix — ' + c.destino;
      document.getElementById('cb-modal-titulo').textContent = c.destino + ' — ' + c.titulo;
      modal.hidden = false;
      modal.querySelector('.cb-modal-fechar').focus();
    }
    function fechar() { modal.hidden = true; if (origem) origem.focus(); }
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.cb-modal-fechar')) fechar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) fechar(); });
  });
})();
