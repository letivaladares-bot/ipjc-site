/* ==========================================================================
   IPJC v3 — Quem Somos
   Linha do tempo expansível, montagem interativa do símbolo, valores e vídeo.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ Linha do tempo */
  function renderTimeline() {
    var lista = document.getElementById('timeline');
    if (!lista) return;
    var hoje = S.hoje();

    lista.innerHTML = D.historia.map(function (h, i) {
      var data = h.data ? S.parseData(h.data) : new Date(parseInt(h.ano, 10), 11, 31);
      var futuro = data > hoje;
      var id = 'tl-' + i;
      return '<li class="tl-item' + (futuro ? '' : ' is-passado') + '">' +
        '<button class="tl-btn" type="button" aria-expanded="false" aria-controls="' + id + '">' +
          '<span class="tl-ano">' + S.esc(h.ano) + '</span>' +
          '<span class="tl-titulo">' + S.esc(h.titulo) + (futuro ? '<span class="tl-chip">Em breve</span>' : '') + '</span>' +
          '<span class="tl-mais" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="tl-painel" id="' + id + '" role="region" aria-label="' + S.esc(h.ano + ' — ' + h.titulo) + '"><div><p>' + S.esc(h.texto) + '</p></div></div>' +
      '</li>';
    }).join('');

    var itens = Array.prototype.slice.call(lista.children);
    function definir(item, aberto) {
      item.classList.toggle('is-aberto', aberto);
      item.querySelector('.tl-btn').setAttribute('aria-expanded', String(aberto));
    }
    itens.forEach(function (item) {
      item.querySelector('.tl-btn').addEventListener('click', function () {
        definir(item, !item.classList.contains('is-aberto'));
        sincronizarBotaoTodos();
      });
    });
    definir(itens[0], true);

    var todos = document.getElementById('tl-todos');
    function sincronizarBotaoTodos() {
      var tudoAberto = itens.every(function (it) { return it.classList.contains('is-aberto'); });
      todos.textContent = tudoAberto ? 'Fechar todos' : 'Abrir todos';
      todos.setAttribute('aria-pressed', String(tudoAberto));
    }
    todos.addEventListener('click', function () {
      var abrir = todos.getAttribute('aria-pressed') !== 'true';
      itens.forEach(function (it) { definir(it, abrir); });
      sincronizarBotaoTodos();
    });

    /* trilho preenchido conforme a rolagem */
    var agendado = false;
    function progresso() {
      agendado = false;
      var r = lista.getBoundingClientRect();
      var meio = window.innerHeight * 0.55;
      var p = Math.min(1, Math.max(0, (meio - r.top) / r.height));
      lista.style.setProperty('--progresso', p.toFixed(3));
    }
    window.addEventListener('scroll', function () {
      if (!agendado) { agendado = true; requestAnimationFrame(progresso); }
    }, { passive: true });
    progresso();
  }

  /* ------------------------------------------------------------ Símbolo interativo */
  function initLogo() {
    var palco = document.getElementById('logo-palco');
    if (!palco) return;
    var abas = Array.prototype.slice.call(document.querySelectorAll('.camada'));
    var modos = abas.map(function (a) { return a.getAttribute('data-modo'); });
    var timerAuto = null, timerMontagem = null, autoplay = !reduzMovimento, visivel = false;

    function selecionar(modo, foco) {
      palco.setAttribute('data-modo', modo);
      abas.forEach(function (a) {
        var ativo = a.getAttribute('data-modo') === modo;
        a.setAttribute('aria-selected', String(ativo));
        a.tabIndex = ativo ? 0 : -1;
        if (ativo && foco) a.focus();
      });
    }

    function pararAuto() { autoplay = false; clearInterval(timerAuto); timerAuto = null; }
    function iniciarAuto() {
      if (!autoplay || timerAuto || !visivel) return;
      timerAuto = setInterval(function () {
        var atual = modos.indexOf(palco.getAttribute('data-modo'));
        selecionar(modos[(atual + 1) % modos.length]);
      }, 6000);
    }

    function montar() {
      clearTimeout(timerMontagem);
      palco.setAttribute('data-modo', 'inicio');
      palco.classList.remove('is-montado');
      void palco.offsetWidth; // reinicia a transição
      requestAnimationFrame(function () {
        palco.classList.add('is-montado');
        timerMontagem = setTimeout(function () {
          selecionar(modos[0]);
          iniciarAuto();
        }, reduzMovimento ? 0 : 1600);
      });
    }

    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { pararAuto(); selecionar(aba.getAttribute('data-modo')); });
      aba.addEventListener('keydown', function (e) {
        var alvo = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') alvo = (i + 1) % abas.length;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') alvo = (i - 1 + abas.length) % abas.length;
        if (e.key === 'Home') alvo = 0;
        if (e.key === 'End') alvo = abas.length - 1;
        if (alvo !== null) { e.preventDefault(); pararAuto(); selecionar(modos[alvo], true); }
      });
    });
    abas.forEach(function (a, i) { a.tabIndex = i === 0 ? 0 : -1; });

    document.getElementById('logo-replay').addEventListener('click', function () {
      pararAuto();
      var modoAtual = palco.getAttribute('data-modo');
      montar();
      clearTimeout(timerMontagem);
      timerMontagem = setTimeout(function () { selecionar(modoAtual === 'inicio' ? modos[0] : modoAtual); }, reduzMovimento ? 0 : 1600);
    });

    if (!('IntersectionObserver' in window) || reduzMovimento) {
      palco.classList.add('is-montado');
      selecionar(modos[0]);
      return;
    }
    var montado = false;
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        visivel = en.isIntersecting;
        if (visivel && !montado) { montado = true; montar(); }
        else if (visivel) iniciarAuto();
        else { clearInterval(timerAuto); timerAuto = null; }
      });
    }, { threshold: 0.45 }).observe(palco);
  }

  /* ------------------------------------------------------------ Valores */
  function renderValores() {
    var lista = document.getElementById('valores');
    if (!lista) return;
    lista.innerHTML = D.valores.map(function (v, i) {
      return '<li class="valor">' +
        '<span class="valor-num" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h3>' + S.esc(v.nome) + '</h3>' +
        '<p>' + S.esc(v.texto) + '</p>' +
      '</li>';
    }).join('');
  }

  S.registrarPagina('quem-somos', function () {
    renderTimeline();
    renderValores();
    S.videoLite(document.getElementById('qs-video'), D.videos.institucionalIPJC, 'Conheça a IPJC — vídeo institucional');
    initLogo();
  });
})();
