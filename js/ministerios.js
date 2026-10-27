/* ==========================================================================
   IPJC v3 — Ministérios
   - ministerios.html: grade agrupada por categoria, com filtro (e #categoria na URL)
   - ministerio.html?m=<slug>: página individual montada a partir de IPJC.ministerios
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;

  /* Cor de destaque de cada categoria (Paleta de Comunicações) */
  var ACENTO = {
    sociedades: 'var(--verde)', ministerios: 'var(--azul)', adoracao: 'var(--mostarda)',
    ensino: 'var(--verde-salvia)', missoes: 'var(--borgonha)'
  };

  function categoriasComMinisterios() {
    return D.categorias.filter(function (c) {
      return D.ministerios.some(function (m) { return m.categoria === c.id; });
    });
  }

  function linkWhatsTexto(texto) {
    return S.linkWhats(D.contato.whatsapp) + '?text=' + encodeURIComponent(texto);
  }

  /* ======================================================== Lista (ministerios.html) */
  function paginaLista() {
    var cats = categoriasComMinisterios();
    var grupos = document.getElementById('grupos');
    var filtros = document.getElementById('filtros');
    var status = document.getElementById('filtro-status');

    grupos.innerHTML = cats.map(function (c) {
      var itens = D.ministerios.filter(function (m) { return m.categoria === c.id; });
      return '<section class="grupo" data-categoria="' + c.id + '" style="--acento:' + ACENTO[c.id] + '" aria-labelledby="g-' + c.id + '">' +
        '<header class="grupo-head">' +
          '<h2 id="g-' + c.id + '">' + esc(c.nome) + '</h2>' +
          '<span class="grupo-qtd">' + itens.length + (itens.length === 1 ? ' ministério' : ' ministérios') + '</span>' +
        '</header>' +
        '<div class="min-grid" data-stagger>' + itens.map(S.cardMinisterio).join('') + '</div>' +
      '</section>';
    }).join('');

    var opcoes = [{ id: 'todos', nome: 'Todos', qtd: D.ministerios.length }].concat(cats.map(function (c) {
      return { id: c.id, nome: c.nome, qtd: D.ministerios.filter(function (m) { return m.categoria === c.id; }).length };
    }));
    filtros.innerHTML = opcoes.map(function (o) {
      return '<button type="button" class="filtro" data-filtro="' + o.id + '" aria-pressed="false">' +
        esc(o.nome) + ' <span class="filtro-qtd">' + o.qtd + '</span></button>';
    }).join('');

    var botoes = Array.prototype.slice.call(filtros.querySelectorAll('.filtro'));
    var secoes = Array.prototype.slice.call(grupos.querySelectorAll('.grupo'));

    function aplicar(id, atualizarUrl) {
      if (!opcoes.some(function (o) { return o.id === id; })) id = 'todos';
      botoes.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtro') === id)); });
      var visiveis = 0;
      secoes.forEach(function (sec) {
        var mostra = id === 'todos' || sec.getAttribute('data-categoria') === id;
        sec.hidden = !mostra;
        if (mostra) {
          visiveis += sec.querySelectorAll('.min-card').length;
          sec.classList.remove('is-entrando'); void sec.offsetWidth; sec.classList.add('is-entrando');
        }
      });
      status.textContent = visiveis + (visiveis === 1 ? ' ministério exibido' : ' ministérios exibidos');
      if (atualizarUrl) history.replaceState(null, '', id === 'todos' ? location.pathname : '#' + id);
    }

    botoes.forEach(function (b) {
      b.addEventListener('click', function () { aplicar(b.getAttribute('data-filtro'), true); });
    });
    aplicar(location.hash.slice(1) || 'todos', false);

    var cta = document.getElementById('min-cta-whats');
    cta.href = linkWhatsTexto('Olá! Gostaria de saber como posso servir em algum ministério da IPJC.');
    cta.target = '_blank'; cta.rel = 'noopener';
  }

  /* ======================================================== Individual (ministerio.html) */
  /* aceita **negrito** e as demais marcações do blog (ver formatarTexto em site.js) */
  function paragrafos(texto) { return S.formatarTexto(texto); }

  function paginaIndividual() {
    var main = document.getElementById('conteudo');
    var slug = new URLSearchParams(location.search).get('m');
    var m = D.ministerios.filter(function (x) { return x.slug === slug; })[0];

    if (!m) {
      document.title = 'Ministério não encontrado — IPJC';
      main.innerHTML =
        '<section class="page-hero"><div class="container">' +
          '<p class="eyebrow">Ministérios</p><h1>Ministério não encontrado</h1>' +
          '<p class="page-lead">O endereço pode ter mudado. Veja a lista completa de ministérios da IPJC.</p>' +
          '<p style="margin-top:28px"><a class="btn" href="ministerios.html">Ver ministérios</a></p>' +
        '</div></section>';
      return;
    }

    var cat = S.nomeCategoria(m.categoria);
    document.title = m.nome + ' — IPJC · Igreja Presbiteriana em Jardim Camburi';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', m.nome + ' da Igreja Presbiteriana em Jardim Camburi. ' + m.resumo);
    main.style.setProperty('--acento', ACENTO[m.categoria] || 'var(--azul)');

    var whats = linkWhatsTexto('Olá! Gostaria de saber mais sobre o ' + m.nome + ' da IPJC.');

    /* informações rápidas (só as que existem) */
    var info = [
      ['relogio', 'Quando', m.quando || 'Conforme programações específicas — acompanhe a agenda'],
      m.publico && ['pessoas', 'Para quem', m.publico],
      m.local && ['pin', 'Onde', m.local]
    ].filter(Boolean);
    var infoHtml = info.map(function (i) {
      return '<li><span class="mi-info-ic" aria-hidden="true">' + S.icon(i[0]) + '</span><span><strong>' + i[1] + '</strong>' + esc(i[2]) + '</span></li>';
    }).join('');

    var logo = (m.logoCor || m.logo)
      ? '<div class="mi-logo reveal"><img src="' + esc(m.logoCor || m.logo) + '" alt="Logo do ' + esc(m.nome) + '"></div>'
      : '';

    /* frentes do ministério (ex.: Culto Infantil e EBD Kids) */
    var subcards = (m.subcards || []).length
      ? '<section class="section--tight mi-frentes" aria-labelledby="frentes-titulo"><div class="container">' +
          '<h2 class="mi-h2 reveal" id="frentes-titulo">' + esc(m.subcardsTitulo || 'Frentes do ministério') + '</h2>' +
          '<div class="subcards" data-stagger>' + m.subcards.map(function (sc) {
            var tag = sc.href ? 'a' : 'article';
            return '<' + tag + ' class="subcard' + (sc.href ? ' subcard--link' : '') + '"' + (sc.href ? ' href="' + esc(sc.href) + '"' : '') + '>' +
              (sc.logo ? '<div class="subcard-logo"><img src="' + esc(sc.logo) + '" alt="' + esc(sc.titulo) + '" loading="lazy"></div>' : '') +
              '<h3>' + esc(sc.titulo) + '</h3><p>' + esc(sc.texto) + '</p>' +
              (sc.href ? '<span class="link-seta">Conhecer ' + S.icon('seta') + '</span>' : '') +
            '</' + tag + '>';
          }).join('') + '</div>' +
        '</div></section>'
      : '';

    /* seções com logo (ex.: Culto Infantil e EBD Kids), alternando os lados */
    var secoesHtml = (m.secoes || []).map(function (sc, i) {
      return '<section class="section--tight mi-secao' + (i % 2 ? ' mi-secao--inv' : '') + '" aria-labelledby="sec-' + i + '"><div class="container mi-secao-grid">' +
        '<div class="mi-secao-logo reveal"><img src="' + esc(sc.logo) + '" alt="Logo do ' + esc(sc.titulo) + '" loading="lazy"></div>' +
        '<div class="mi-secao-texto reveal">' +
          (sc.quando ? '<p class="eyebrow">' + esc(sc.quando) + '</p>' : '') +
          '<h2 id="sec-' + i + '">' + esc(sc.titulo) + '</h2>' + paragrafos(sc.texto) +
        '</div>' +
      '</div></section>';
    }).join('');

    /* faixa de ações (ex.: como participar de missões) */
    var acoesHtml = m.acoes
      ? '<section class="section mi-acoes-sec" aria-labelledby="acoes-titulo"><div class="container">' +
          '<div class="section-head"><div><p class="eyebrow reveal">Faça parte</p><h2 class="reveal" id="acoes-titulo">' + esc(m.acoes.titulo) + '</h2></div>' +
            (m.acoes.intro ? '<p class="reveal">' + esc(m.acoes.intro) + '</p>' : '') + '</div>' +
          '<ol class="mi-acoes-grid" data-stagger>' + m.acoes.itens.map(function (a, i) {
            return '<li class="mi-acao">' +
              '<span class="mi-acao-num" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' +
              '<span class="mi-acao-ic" aria-hidden="true">' + S.icon(a.icone) + '</span>' +
              '<h3>' + esc(a.titulo) + '</h3><p>' + esc(a.texto) + '</p>' +
              (a.link ? '<a class="link-seta" href="' + esc(a.link) + '">' + esc(a.linkTexto || 'Saiba mais') + ' ' + S.icon('seta') + '</a>' : '') +
            '</li>';
          }).join('') + '</ol>' +
        '</div></section>'
      : '';

    /* classes da EBD */
    var classesHtml = (m.classes || []).length
      ? '<section class="section--tight mi-classes" aria-labelledby="classes-titulo"><div class="container">' +
          '<h2 class="mi-h2 reveal" id="classes-titulo">Classes, professores e locais</h2>' +
          '<ul class="classes" data-stagger>' + m.classes.map(function (c) {
            return '<li class="classe">' +
              '<h3>' + esc(c.nome) + (c.publico ? ' <small>' + esc(c.publico) + '</small>' : '') + '</h3>' +
              (c.descricao ? '<p>' + esc(c.descricao) + '</p>' : '') +
              (c.local ? '<p class="classe-local">' + S.icon('pin') + esc(c.local) + '</p>' : '') +
              (c.professores ? '<p class="classe-prof"><strong>Professores</strong>' + esc(c.professores) + '</p>' : '') +
              (c.link ? '<a class="link-seta" href="' + esc(c.link) + '">Saiba mais ' + S.icon('seta') + '</a>' : '') +
            '</li>';
          }).join('') + '</ul>' +
        '</div></section>'
      : '';

    /* currículo anual: módulo atual aberto, próxima aula em destaque */
    var curriculoHtml = '';
    if (m.curriculo) {
      var hojeIso = S.chaveData(S.hoje());
      var proxima = null;
      m.curriculo.modulos.forEach(function (mod) { mod.aulas.forEach(function (a) { if (!proxima && a[0] >= hojeIso) proxima = a[0]; }); });
      curriculoHtml =
        '<section class="section mi-curriculo" aria-labelledby="curriculo-titulo"><div class="container">' +
          '<div class="section-head"><div><p class="eyebrow reveal">Currículo ' + m.curriculo.ano + '</p>' +
            '<h2 class="reveal" id="curriculo-titulo">O que estamos estudando</h2></div>' +
            '<p class="reveal">Os temas do ano, domingo a domingo. Toque em um módulo para ver as aulas.</p></div>' +
          '<div class="modulos" data-stagger>' + m.curriculo.modulos.map(function (mod, i) {
            var temProxima = mod.aulas.some(function (a) { return a[0] === proxima; });
            var ini = S.parseData(mod.aulas[0][0]), fim = S.parseData(mod.aulas[mod.aulas.length - 1][0]);
            var periodo = S.MESES[ini.getMonth()] + (ini.getMonth() !== fim.getMonth() ? ' a ' + S.MESES[fim.getMonth()] : '');
            return '<details class="modulo"' + (temProxima ? ' open' : '') + '>' +
              '<summary><span class="modulo-num">' + String(i + 1).padStart(2, '0') + '</span>' +
                '<span class="modulo-tit"><strong>' + esc(mod.titulo) + '</strong>' +
                  (mod.subtitulo ? '<span>' + esc(mod.subtitulo) + '</span>' : '') + '</span>' +
                '<span class="modulo-per">' + periodo + (mod.nota ? ' · ' + esc(mod.nota) : '') + '</span></summary>' +
              '<ol class="aulas">' + mod.aulas.map(function (a) {
                var d = S.parseData(a[0]);
                var cls = a[0] === proxima ? ' class="is-proxima"' : (a[0] < hojeIso ? ' class="is-passada"' : '');
                return '<li' + cls + '><time datetime="' + a[0] + '">' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '</time>' +
                  '<span>' + esc(a[1]) + (a[0] === proxima ? ' <em class="aula-tag aula-tag--prox">Próxima aula</em>' : '') +
                  (a[2] ? ' <em class="aula-tag">' + esc(a[2]) + '</em>' : '') + '</span></li>';
              }).join('') + '</ol>' +
            '</details>';
          }).join('') + '</div>' +
        '</div></section>';
    }

    /* próximas programações ligadas a este ministério */
    var eventos = S.eventosFuturos().filter(function (e) { return e.ministerio === m.slug; }).slice(0, 3);
    var eventosHtml = eventos.length
      ? '<div class="eventos-grid" data-stagger>' + eventos.map(S.cardEvento).join('') + '</div>'
      : '<p class="vazio">Nenhuma programação especial agendada no momento. <a href="programacoes.html">Ver a agenda da igreja</a>.</p>';

    /* outros ministérios: primeiro os da mesma categoria */
    var outros = D.ministerios.filter(function (x) { return x.slug !== m.slug; })
      .sort(function (a, b) { return (b.categoria === m.categoria) - (a.categoria === m.categoria); })
      .slice(0, 4);

    /* anterior / próximo na ordem da lista */
    var idx = D.ministerios.indexOf(m);
    var ant = D.ministerios[(idx - 1 + D.ministerios.length) % D.ministerios.length];
    var prox = D.ministerios[(idx + 1) % D.ministerios.length];

    main.innerHTML =
      '<section class="mi-hero" aria-labelledby="mi-titulo">' +
        '<div class="calcadao" aria-hidden="true"></div>' +
        '<div class="container mi-hero-grid">' +
          '<div>' +
            '<nav class="migalhas reveal" aria-label="Você está em"><a href="ministerios.html">Ministérios</a><span aria-hidden="true">/</span>' +
              '<a href="ministerios.html#' + m.categoria + '">' + esc(cat) + '</a></nav>' +
            logo +
            '<h1 class="reveal" id="mi-titulo">' + esc(m.nome) + '</h1>' +
            '<p class="page-lead reveal">' + esc(m.resumo) + '</p>' +
            '<div class="mi-acoes reveal">' +
              '<a class="btn" href="' + whats + '" target="_blank" rel="noopener">' + S.icon('whatsapp') + 'Quero participar</a>' +
              '<a class="btn btn--ghost" href="#agenda">Programações</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section mi-sobre" aria-labelledby="sobre-titulo"><div class="container mi-sobre-grid">' +
        '<div class="mi-texto">' +
          '<h2 class="mi-h2 reveal" id="sobre-titulo">Sobre o ministério</h2>' +
          '<div class="reveal">' + paragrafos(m.descricao) + '</div>' +
          (m.blocos || []).map(function (b) {
            return '<div class="mi-bloco reveal"><h3>' + esc(b.titulo) + '</h3>' + paragrafos(b.texto) + '</div>';
          }).join('') +
          [m.lema, m.versiculo].filter(Boolean).map(function (q) {
            return '<blockquote class="mi-lema reveal"><p>“' + esc(q.texto) + '”</p><cite>' + esc(q.ref) + '</cite></blockquote>';
          }).join('') +
          (m.historia ? '<div class="mi-historia reveal"><h3>Um pouco de história</h3>' + paragrafos(m.historia) + '</div>' : '') +
        '</div>' +
        '<aside class="mi-info reveal" aria-label="Informações">' +
          (infoHtml ? '<ul>' + infoHtml + '</ul>' : '') +
          '<div class="mi-info-contato">' +
            '<p>Quer participar ou tirar dúvidas?</p>' +
            '<a class="link-seta" href="' + whats + '" target="_blank" rel="noopener">Falar pelo WhatsApp ' + S.icon('seta') + '</a>' +
          '</div>' +
        '</aside>' +
      '</div></section>' +

      secoesHtml + acoesHtml + subcards + classesHtml + curriculoHtml +

      '<section class="section section--bege" id="agenda" aria-labelledby="agenda-titulo"><div class="container">' +
        '<div class="section-head"><div><p class="eyebrow reveal">Agenda</p><h2 class="reveal" id="agenda-titulo">Próximas programações</h2></div>' +
          '<a class="link-seta reveal" href="programacoes.html">Calendário completo ' + S.icon('seta') + '</a></div>' +
        eventosHtml +
      '</div></section>' +

      '<section class="section" aria-labelledby="outros-titulo"><div class="container">' +
        '<div class="section-head"><div><p class="eyebrow reveal">Continue conhecendo</p><h2 class="reveal" id="outros-titulo">Outros ministérios</h2></div>' +
          '<a class="link-seta reveal" href="ministerios.html">Ver todos ' + S.icon('seta') + '</a></div>' +
        '<div class="min-grid" data-stagger>' + outros.map(S.cardMinisterio).join('') + '</div>' +
        '<nav class="mi-pager" aria-label="Navegar entre ministérios">' +
          '<a href="ministerio.html?m=' + ant.slug + '" rel="prev"><span>Anterior</span>' + esc(ant.nome) + '</a>' +
          '<a href="ministerio.html?m=' + prox.slug + '" rel="next"><span>Próximo</span>' + esc(prox.nome) + '</a>' +
        '</nav>' +
      '</div></section>';
  }

  S.registrarPagina('ministerios', paginaLista);
  S.registrarPagina('ministerio', paginaIndividual);
})();
