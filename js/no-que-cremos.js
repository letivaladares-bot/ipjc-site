/* ==========================================================================
   IPJC v3 — No que Cremos
   Cards dos Cinco Solas (com versículo), doutrinas, Símbolos de Westminster
   com contagem animada e a pergunta 1 do Breve Catecismo.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function num(i) { return String(i + 1).padStart(2, '0'); }

  /* ------------------------------------------------------------ Cinco Solas */
  function renderSolas() {
    var lista = document.getElementById('solas');
    if (!lista) return;
    lista.innerHTML = D.solas.map(function (s, i) {
      var id = 'sola-verso-' + i;
      return '<li class="sola">' +
        '<span class="sola-num" aria-hidden="true">' + num(i) + '</span>' +
        '<h3 class="sola-nome" lang="la">' + S.esc(s.nome) + '</h3>' +
        '<p class="sola-trad">' + S.esc(s.traducao) + '</p>' +
        '<p class="sola-texto">' + S.esc(s.texto) + '</p>' +
        '<button class="sola-btn" type="button" aria-expanded="false" aria-controls="' + id + '">' +
          '<span class="x" aria-hidden="true"></span><span class="rotulo">Ler versículo</span>' +
        '</button>' +
        '<div class="sola-verso" id="' + id + '">' +
          '<span class="sola-num" aria-hidden="true">' + num(i) + ' · ' + S.esc(s.nome) + '</span>' +
          '<blockquote><p>“' + S.esc(s.versiculo) + '”</p><cite>' + S.esc(s.ref) + '</cite></blockquote>' +
        '</div>' +
      '</li>';
    }).join('');

    var cards = Array.prototype.slice.call(lista.children);
    function definir(card, aberto) {
      card.classList.toggle('is-aberto', aberto);
      var btn = card.querySelector('.sola-btn');
      btn.setAttribute('aria-expanded', String(aberto));
      btn.querySelector('.rotulo').textContent = aberto ? 'Fechar' : 'Ler versículo';
    }
    cards.forEach(function (card) {
      card.querySelector('.sola-btn').addEventListener('click', function () {
        definir(card, !card.classList.contains('is-aberto'));
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      cards.forEach(function (c) {
        if (c.classList.contains('is-aberto')) { definir(c, false); c.querySelector('.sola-btn').focus(); }
      });
    });
  }

  /* ------------------------------------------------------------ Doutrinas */
  function renderDoutrinas() {
    var lista = document.getElementById('doutrinas');
    if (!lista) return;
    lista.innerHTML = D.doutrinas.map(function (d) {
      return '<li class="doutrina">' +
        '<span class="doutrina-icone" aria-hidden="true">' + S.icon(d.icone) + '</span>' +
        '<h3>' + S.esc(d.titulo) + '</h3>' +
        '<p>' + S.esc(d.texto) + '</p>' +
      '</li>';
    }).join('');
  }

  /* ------------------------------------------------------------ Westminster */
  function contar(el) {
    var alvo = parseInt(el.getAttribute('data-alvo'), 10);
    var duracao = 1400, inicio = null;
    function passo(t) {
      if (!inicio) inicio = t;
      var p = Math.min(1, (t - inicio) / duracao);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  function renderSimbolos() {
    var lista = document.getElementById('simbolos');
    if (!lista) return;
    lista.innerHTML = D.westminster.map(function (w) {
      return '<li class="simbolo-card">' +
        '<span class="simbolo-num" data-alvo="' + w.numero + '">' + w.numero + '</span>' +
        '<span class="simbolo-unidade">' + S.esc(w.unidade) + '</span>' +
        '<h3>' + S.esc(w.nome) + '</h3>' +
        '<p>' + S.esc(w.texto) + '</p>' +
      '</li>';
    }).join('');

    if (reduzMovimento || !('IntersectionObserver' in window)) return;
    var nums = Array.prototype.slice.call(lista.querySelectorAll('.simbolo-num'));
    nums.forEach(function (n) { n.textContent = '0'; });
    var obs = new IntersectionObserver(function (entradas) {
      if (!entradas.some(function (en) { return en.isIntersecting; })) return;
      nums.forEach(contar);
      obs.disconnect();
    }, { threshold: 0.4 });
    obs.observe(lista);
  }

  function initCatecismo() {
    var bloco = document.getElementById('catecismo');
    var btn = document.getElementById('catecismo-btn');
    if (!bloco || !btn) return;
    btn.addEventListener('click', function () {
      bloco.classList.add('is-aberto');
      btn.setAttribute('aria-expanded', 'true');
      var resp = document.getElementById('catecismo-resposta');
      resp.setAttribute('tabindex', '-1');
      resp.focus({ preventScroll: true });
    });
  }

  S.registrarPagina('no-que-cremos', function () {
    renderSolas();
    renderDoutrinas();
    renderSimbolos();
    initCatecismo();
  });
})();
