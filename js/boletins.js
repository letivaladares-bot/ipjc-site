/* ==========================================================================
   IPJC v3 — Boletins (mensais)
   Destaque para o mais recente e arquivo por ano (#2026 na URL).

   Capa de cada boletim, nesta ordem:
   1. `capa` — imagem enviada (ex.: primeira página exportada do Canva, 600×800 px);
   2. link do Google Drive — miniatura da 1ª página gerada pelo próprio Drive
      (o arquivo precisa estar compartilhado como "qualquer pessoa com o link");
   3. PDF hospedado junto do site — a 1ª página é desenhada com PDF.js;
   4. capa gerada na identidade da igreja (fallback).
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';

  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function partes(b) { var p = String(b.mes || '').split('-'); return { ano: p[0], mes: parseInt(p[1], 10) - 1 }; }
  function nomeMes(b) { var p = partes(b); return S.MESES_LONGOS[p.mes] || ''; }
  function titulo(b) { return b.titulo || 'Boletim de ' + nomeMes(b); }
  function rotuloData(b) { var p = partes(b); return cap(nomeMes(b)) + ' de ' + p.ano; }

  /* ID do arquivo em links do Drive: /file/d/<id>/..., ?id=<id> */
  function driveId(url) {
    var m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/.exec(url || '');
    return m ? m[1] : null;
  }
  function pdfLocal(url) { return /\.pdf($|[?#])/i.test(url || '') && !/^https?:/i.test(url); }

  function capaGerada(b) {
    var p = partes(b);
    return '<div class="bol-capa bol-capa--gerada" aria-hidden="true">' +
      '<img src="assets/img/logo/ipjc-logo-branca.svg" alt="" width="140" height="38">' +
      '<span class="bol-capa-rotulo">Boletim</span>' +
      '<span class="bol-capa-mes">' + esc(cap(nomeMes(b))) + '</span>' +
      '<span class="bol-capa-ano">' + esc(p.ano) + '</span>' +
    '</div>';
  }

  /* Gera a camada da capa; a imagem real fica por cima da gerada e some se falhar */
  function capa(b) {
    var src = b.capa || (driveId(b.arquivo) ? 'https://drive.google.com/thumbnail?id=' + driveId(b.arquivo) + '&sz=w800' : '');
    var real = src
      ? '<img class="bol-capa bol-capa--real" src="' + esc(src) + '" alt="" loading="lazy" width="600" height="800" referrerpolicy="no-referrer" onerror="this.remove()">'
      : (pdfLocal(b.arquivo) ? '<canvas class="bol-capa bol-capa--real" data-pdf="' + esc(b.arquivo) + '" aria-hidden="true"></canvas>' : '');
    return '<div class="bol-capa-pilha">' + capaGerada(b) + real + '</div>';
  }

  /* Desenha a 1ª página dos PDFs hospedados no site (carrega o PDF.js só se precisar) */
  function desenharPdfs(ctx) {
    var canvases = Array.prototype.slice.call(ctx.querySelectorAll('canvas[data-pdf]:not([data-ok])'));
    if (!canvases.length) return;
    carregarPdfJs(function (pdfjsLib) {
      canvases.forEach(function (cv) {
        cv.setAttribute('data-ok', '1');
        pdfjsLib.getDocument(cv.getAttribute('data-pdf')).promise
          .then(function (doc) { return doc.getPage(1); })
          .then(function (pagina) {
            var vp = pagina.getViewport({ scale: 1 });
            var escala = 800 / vp.height;
            var v = pagina.getViewport({ scale: escala });
            cv.width = v.width; cv.height = v.height;
            return pagina.render({ canvasContext: cv.getContext('2d'), viewport: v }).promise;
          })
          .then(function () { cv.classList.add('is-pronto'); })
          .catch(function () { cv.remove(); });
      });
    });
  }
  var filaPdf = null;
  function carregarPdfJs(cb) {
    if (window.pdfjsLib) return cb(window.pdfjsLib);
    if (filaPdf) return filaPdf.push(cb);
    filaPdf = [cb];
    var s = document.createElement('script');
    s.src = PDFJS + 'pdf.min.js';
    s.onload = function () {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
      filaPdf.forEach(function (f) { f(window.pdfjsLib); });
    };
    s.onerror = function () {   /* sem PDF.js: fica a capa gerada */
      Array.prototype.forEach.call(document.querySelectorAll('canvas[data-pdf]'), function (c) { c.remove(); });
    };
    document.head.appendChild(s);
  }

  function card(b) {
    var conteudo = '<div class="bol-capa-wrap">' + capa(b) + '</div>' +
      '<div class="bol-info">' +
        '<span class="bol-data">' + esc(rotuloData(b)) + '</span>' +
        '<h3>' + esc(titulo(b)) + '</h3>' +
      '</div>';
    return b.arquivo
      ? '<a class="bol-card" href="' + esc(b.arquivo) + '" target="_blank" rel="noopener" aria-label="Abrir ' + esc(titulo(b)) + ' (' + esc(rotuloData(b)) + ')">' + conteudo + '<span class="bol-abrir" aria-hidden="true">' + S.icon('diagonal') + '</span></a>'
      : '<article class="bol-card bol-card--sem-link">' + conteudo + '</article>';
  }

  function renderRecente(b) {
    document.getElementById('bol-recente-sec').hidden = false;
    var alvo = document.getElementById('bol-recente');
    alvo.innerHTML =
      '<article class="bol-destaque reveal">' +
        '<div class="bol-destaque-capa">' + capa(b) + '</div>' +
        '<div class="bol-destaque-texto">' +
          '<p class="eyebrow">Boletim do mês</p>' +
          '<h3>' + esc(titulo(b)) + '</h3>' +
          '<p class="bol-destaque-data">' + S.icon('calendario') + esc(rotuloData(b)) + '</p>' +
          (b.resumo ? '<p class="bol-destaque-resumo">' + esc(b.resumo) + '</p>' : '') +
          (b.arquivo ? '<a class="btn" href="' + esc(b.arquivo) + '" target="_blank" rel="noopener">Ler o boletim ' + S.icon('seta') + '</a>' : '') +
        '</div>' +
      '</article>';
    desenharPdfs(alvo);
  }

  S.registrarPagina('boletins', function () {
    var lista = document.getElementById('bol-lista');
    var anosEl = document.getElementById('bol-anos');
    var status = document.getElementById('bol-status');

    var todos = (D.boletins || []).filter(function (b) { return /^\d{4}-\d{2}$/.test(b.mes || ''); })
      .sort(function (a, b) { return a.mes < b.mes ? 1 : -1; });

    if (!todos.length) {
      anosEl.hidden = true;
      lista.innerHTML = '<p class="vazio">Os boletins serão publicados aqui em breve.</p>';
      return;
    }

    renderRecente(todos[0]);

    var anos = todos.map(function (b) { return partes(b).ano; }).filter(function (a, i, arr) { return arr.indexOf(a) === i; });
    anosEl.innerHTML = anos.map(function (a) {
      var n = todos.filter(function (b) { return partes(b).ano === a; }).length;
      return '<button type="button" class="filtro" data-ano="' + a + '" aria-pressed="false">' + a + ' <span class="filtro-qtd">' + n + '</span></button>';
    }).join('');

    function mostrar(a, atualizarUrl) {
      if (anos.indexOf(a) === -1) a = anos[0];
      Array.prototype.forEach.call(anosEl.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ano') === a)); });
      var doAno = todos.filter(function (b) { return partes(b).ano === a; });
      lista.innerHTML = '<div class="bol-grid">' + doAno.map(card).join('') + '</div>';
      lista.classList.remove('is-entrando'); void lista.offsetWidth; lista.classList.add('is-entrando');
      desenharPdfs(lista);
      status.textContent = doAno.length + (doAno.length === 1 ? ' boletim' : ' boletins') + ' de ' + a;
      if (atualizarUrl) history.replaceState(null, '', '#' + a);
    }

    anosEl.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ano]');
      if (b) mostrar(b.getAttribute('data-ano'), true);
    });
    mostrar(location.hash.slice(1), false);
  });
})();
