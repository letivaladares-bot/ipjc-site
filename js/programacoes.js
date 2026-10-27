/* ==========================================================================
   IPJC v3 — Programações
   1. Programação fixa (cultos + semana)
   2. Calendário mensal: dias com programações especiais levam ao evento;
      domingos e quartas mostram a programação fixa
   3. Programações especiais: filtro por categoria, destaque via #id,
      inscrição, WhatsApp oficial e arquivo .ics para a agenda do celular
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function chave(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function mesmoDia(a, b) { return a.getTime() === b.getTime(); }

  var eventos = S.eventosFuturos();
  var hoje = S.hoje();

  /* Datas de cada evento (inclui todos os dias de eventos com data final) */
  var porDia = {};
  eventos.forEach(function (e) {
    var d = S.parseData(e.data), fim = S.parseData(e.dataFim || e.data);
    for (var x = new Date(d); x <= fim; x.setDate(x.getDate() + 1)) {
      (porDia[chave(x)] = porDia[chave(x)] || []).push(e);
    }
  });

  /* Programação fixa marcada no calendário */
  var FIXOS = { 0: 'Cultos 9h e 18h30 · EBD 10h50', 3: 'Ensaio do Coral Jardim · 19h30' };

  var periodo = S.periodoEvento;
  var baixarIcs = S.baixarIcs;

  /* ------------------------------------------------------------ 1. Programação fixa */
  function renderFixa() {
    var t = document.getElementById('cultos-resumo');
    if (t) t.innerHTML = esc(D.cultos.resumo).split(' · ').join('<span class="sep">·</span>');
    var lista = document.getElementById('semana');
    if (!lista) return;
    lista.innerHTML = D.programacaoRegular.filter(function (p) { return !p.destaque; }).map(function (p) {
      return '<li class="semana-item">' +
        '<span class="semana-quando">' + esc(p.quando) + '</span>' +
        '<h4>' + esc(p.titulo) + '</h4>' +
        '<p class="semana-meta">' + (p.horario ? '<strong>' + esc(p.horario) + '</strong> · ' : '') + esc(p.local) + '</p>' +
        '<p class="semana-desc">' + esc(p.descricao || '') + '</p>' +
      '</li>';
    }).join('');
  }

  /* ------------------------------------------------------------ 3. Especiais */
  var filtroAtual = 'todos';

  function cardEspecial(e) {
    var d = S.parseData(e.data);
    var min = e.ministerio ? D.ministerios.filter(function (m) { return m.slug === e.ministerio; })[0] : null;
    var whats = S.linkWhats(e.whatsapp || D.contato.whatsapp) + '?text=' + encodeURIComponent('Olá! Gostaria de saber mais sobre: ' + e.titulo + '.');
    var visual = e.arte
      ? '<img class="esp-arte" src="' + esc(e.arte) + '" alt="Arte oficial: ' + esc(e.titulo) + '" loading="lazy" width="1080" height="1080">'
      : '<div class="esp-data" aria-hidden="true"><span class="dia">' + d.getDate() + '</span><span class="mes">' + S.MESES[d.getMonth()] + '</span><span class="ano">' + d.getFullYear() + '</span></div>';

    return '<article class="esp-card cat-' + esc(e.categoria || 'geral') + '" id="' + esc(e.id) + '" tabindex="-1" data-categoria="' + esc(e.categoria || 'geral') + '">' +
      '<div class="esp-visual">' + visual + '</div>' +
      '<div class="esp-corpo">' +
        '<div class="esp-tags"><span class="tag esp-tag">' + esc(S.nomeCategoria(e.categoria) || 'Geral') + '</span>' +
          (min ? '<a class="esp-min" href="ministerio.html?m=' + encodeURIComponent(min.slug) + '">' + esc(min.nome) + '</a>' : '') + '</div>' +
        '<h3><a href="' + S.linkEvento(e) + '">' + esc(e.titulo) + '</a></h3>' +
        '<ul class="esp-meta">' +
          '<li>' + S.icon('calendario') + '<span>' + esc(periodo(e)) + '</span></li>' +
          (e.horario ? '<li>' + S.icon('relogio') + '<span>' + esc(e.horario) + '</span></li>' : '') +
          (e.local ? '<li>' + S.icon('pin') + '<span>' + esc(e.local) + '</span></li>' : '') +
        '</ul>' +
        (e.descricao ? '<p class="esp-desc">' + esc(e.descricao) + '</p>' : '') +
        '<div class="esp-acoes">' +
          '<a class="btn" href="' + S.linkEvento(e) + '">Ver detalhes ' + S.icon('seta') + '</a>' +
          (e.inscricao ? '<a class="btn btn--mostarda" href="' + esc(e.inscricao) + '" target="_blank" rel="noopener">Fazer inscrição</a>' : '') +
          '<a class="btn btn--ghost" href="' + whats + '" target="_blank" rel="noopener">' + S.icon('whatsapp') + 'Tirar dúvidas</a>' +
          '<button class="esp-ics" type="button" data-ics="' + esc(e.id) + '">' + S.icon('calendario') + 'Adicionar à agenda</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderEspeciais() {
    var lista = document.getElementById('esp-lista');
    var filtros = document.getElementById('esp-filtros');
    var status = document.getElementById('esp-status');
    if (!lista) return;

    var opcoes = [{ id: 'todos', nome: 'Todas', qtd: eventos.length }].concat(D.categorias.map(function (c) {
      return { id: c.id, nome: c.nome, qtd: eventos.filter(function (e) { return (e.categoria || 'geral') === c.id; }).length };
    }));
    filtros.innerHTML = opcoes.map(function (o) {
      return '<button type="button" class="filtro" data-filtro="' + o.id + '" aria-pressed="false"' + (o.qtd ? '' : ' disabled') + '>' +
        esc(o.nome) + ' <span class="filtro-qtd">' + o.qtd + '</span></button>';
    }).join('');

    function desenhar() {
      var vis = eventos.filter(function (e) { return filtroAtual === 'todos' || (e.categoria || 'geral') === filtroAtual; });
      lista.innerHTML = vis.length
        ? vis.map(cardEspecial).join('')
        : '<p class="vazio">Nenhuma programação especial agendada' + (filtroAtual === 'todos' ? '' : ' nesta categoria') + ' no momento. Acompanhe nossas redes!</p>';
      Array.prototype.forEach.call(filtros.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtro') === filtroAtual)); });
      status.textContent = vis.length + (vis.length === 1 ? ' programação exibida' : ' programações exibidas');
    }

    filtros.addEventListener('click', function (ev) {
      var b = ev.target.closest('.filtro');
      if (!b || b.disabled) return;
      filtroAtual = b.getAttribute('data-filtro');
      desenhar();
    });
    lista.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ics]');
      if (!b) return;
      var e = eventos.filter(function (x) { return x.id === b.getAttribute('data-ics'); })[0];
      if (e) baixarIcs(e);
    });
    desenhar();
  }

  /* Leva até o card do evento e o destaca */
  function irParaEvento(id, rolar) {
    var card = document.getElementById(id);
    if (!card) {   /* evento filtrado: volta para "Todas" */
      filtroAtual = 'todos';
      var b = document.querySelector('#esp-filtros [data-filtro="todos"]');
      if (b) b.click();
      card = document.getElementById(id);
    }
    if (!card) return;
    history.replaceState(null, '', '#' + id);
    if (rolar !== false) card.scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth', block: 'center' });
    card.classList.remove('is-destaque'); void card.offsetWidth; card.classList.add('is-destaque');
    card.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------ 2. Calendário */
  function initCalendario() {
    var grade = document.getElementById('cal-grade');
    if (!grade) return;
    var titulo = document.getElementById('cal-mes');
    var btnAnt = document.getElementById('cal-ant');
    var primeiroMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    var mes = new Date(primeiroMes);

    var alvo = location.hash.slice(1) && eventos.filter(function (e) { return e.id === location.hash.slice(1); })[0];
    if (alvo) { var da = S.parseData(alvo.data); mes = new Date(da.getFullYear(), da.getMonth(), 1); }

    function desenhar() {
      titulo.textContent = S.MESES_LONGOS[mes.getMonth()].replace(/^./, function (c) { return c.toUpperCase(); }) + ' ' + mes.getFullYear();
      btnAnt.disabled = mes <= primeiroMes;
      var html = '';
      var inicio = mes.getDay();
      for (var i = 0; i < inicio; i++) html += '<div class="cal-dia cal-dia--vazio" role="gridcell"></div>';
      var ultimo = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
      for (var n = 1; n <= ultimo; n++) {
        var d = new Date(mes.getFullYear(), mes.getMonth(), n);
        var evs = porDia[chave(d)] || [];
        var fixo = FIXOS[d.getDay()];
        var passado = d < hoje;
        var classes = 'cal-dia' + (mesmoDia(d, hoje) ? ' is-hoje' : '') + (passado ? ' is-passado' : '') + (evs.length ? ' tem-evento' : '');
        var chips = evs.slice(0, 2).map(function (e) {
          return '<span class="cal-chip cat-' + esc(e.categoria || 'geral') + '">' + esc(e.titulo) + '</span>';
        }).join('') + (evs.length > 2 ? '<span class="cal-mais">+' + (evs.length - 2) + '</span>' : '');
        var fixoHtml = fixo && !passado ? '<span class="cal-fixo">' + esc(fixo) + '</span>' : '';
        var rotulo = n + ' de ' + S.MESES_LONGOS[d.getMonth()] + (evs.length ? ': ' + evs.map(function (e) { return e.titulo; }).join('; ') : (fixo && !passado ? ': ' + fixo : ''));
        var interno = '<span class="cal-num">' + n + '</span>' + chips + fixoHtml;

        if (evs.length) {
          html += '<div class="' + classes + '" role="gridcell"><button type="button" class="cal-btn" data-evento="' + esc(evs[0].id) + '" aria-label="' + esc(rotulo) + '">' + interno + '</button></div>';
        } else if (fixo && !passado) {
          html += '<div class="' + classes + ' tem-fixo" role="gridcell"><button type="button" class="cal-btn" data-fixo="1" aria-label="' + esc(rotulo) + '">' + interno + '</button></div>';
        } else {
          html += '<div class="' + classes + '" role="gridcell" aria-label="' + esc(rotulo) + '">' + interno + '</div>';
        }
      }
      grade.innerHTML = html;
    }

    grade.addEventListener('click', function (ev) {
      var b = ev.target.closest('.cal-btn');
      if (!b) return;
      if (b.hasAttribute('data-evento')) location.href = 'evento.html?e=' + encodeURIComponent(b.getAttribute('data-evento'));
      else document.getElementById('fixa').scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start' });
    });
    btnAnt.addEventListener('click', function () { mes.setMonth(mes.getMonth() - 1); desenhar(); });
    document.getElementById('cal-prox').addEventListener('click', function () { mes.setMonth(mes.getMonth() + 1); desenhar(); });
    document.getElementById('cal-hoje').addEventListener('click', function () { mes = new Date(primeiroMes); desenhar(); });
    var btnProximo = document.getElementById('cal-proximo');
    if (!eventos.length) btnProximo.hidden = true;
    btnProximo.addEventListener('click', function () {
      var d = S.parseData(eventos[0].data);
      mes = new Date(d.getFullYear(), d.getMonth(), 1);
      desenhar();
      var cel = grade.querySelector('[data-evento="' + eventos[0].id + '"]');
      if (cel) cel.focus();
    });

    /* legenda só com as categorias presentes na agenda */
    var usadas = D.categorias.filter(function (c) { return eventos.some(function (e) { return (e.categoria || 'geral') === c.id; }); });
    document.getElementById('cal-legenda').innerHTML =
      usadas.map(function (c) { return '<li class="cat-' + c.id + '"><span class="pt"></span>' + esc(c.nome) + '</li>'; }).join('') +
      '<li class="leg-fixo"><span class="pt"></span>Programação fixa</li>';

    desenhar();
  }

  S.registrarPagina('programacoes', function () {
    renderFixa();
    renderEspeciais();
    initCalendario();
    /* chegou por link de um evento (ex.: da home) */
    var id = location.hash.slice(1);
    if (id && eventos.some(function (e) { return e.id === id; })) {
      setTimeout(function () { irParaEvento(id); }, 350);
    }
  });
})();
