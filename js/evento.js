/* ==========================================================================
   IPJC v3 — Página de uma programação (evento.html?e=<id>)
   Arte, data, horário, local com mapa, inscrição, WhatsApp oficial,
   adicionar à agenda e compartilhar.
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;

  function paragrafos(texto) {
    return String(texto || '').split(/\n\s*\n/).filter(Boolean).map(function (p) { return '<p>' + esc(p.trim()) + '</p>'; }).join('');
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function compartilhar(e, botao) {
    var dados = { title: e.titulo, text: e.titulo + ' — ' + S.periodoEvento(e), url: location.href };
    if (navigator.share) { navigator.share(dados).catch(function () {}); return; }
    var feito = function () {
      var rotulo = botao.querySelector('.rotulo');
      rotulo.textContent = 'Link copiado!';
      setTimeout(function () { rotulo.textContent = 'Compartilhar'; }, 2200);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(feito);
    else { window.prompt('Copie o link:', location.href); }
  }

  S.registrarPagina('evento', function () {
    var main = document.getElementById('conteudo');
    var id = new URLSearchParams(location.search).get('e');
    var e = (D.programacoes || []).filter(function (x) { return x.id === id; })[0];

    if (!e) {
      document.title = 'Programação não encontrada — IPJC';
      main.innerHTML =
        '<section class="page-hero"><div class="container">' +
          '<p class="eyebrow">Programações</p><h1>Programação não encontrada</h1>' +
          '<p class="page-lead">Ela pode ter sido removida ou o endereço mudou. Veja a agenda completa da igreja.</p>' +
          '<p style="margin-top:28px"><a class="btn" href="programacoes.html">Ver programações</a></p>' +
        '</div></section>';
      return;
    }

    var cat = e.categoria || 'geral';
    var d = S.parseData(e.data);
    var passou = S.parseData(e.dataFim || e.data) < S.hoje();
    var min = e.ministerio ? D.ministerios.filter(function (m) { return m.slug === e.ministerio; })[0] : null;
    var endereco = S.enderecoEvento(e);
    var mapaBusca = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(endereco);
    var waze = 'https://waze.com/ul?q=' + encodeURIComponent(endereco) + '&navigate=yes';
    var whats = S.linkWhats(e.whatsapp || D.contato.whatsapp) + '?text=' + encodeURIComponent('Olá! Gostaria de saber mais sobre: ' + e.titulo + '.');

    document.title = e.titulo + ' — IPJC · Igreja Presbiteriana em Jardim Camburi';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', e.titulo + ' · ' + S.periodoEvento(e) + (e.local ? ' · ' + e.local : '') + '. ' + (e.descricao || ''));
    main.classList.add('cat-' + cat);

    var visual = e.arte
      ? '<img class="ev-arte" src="' + esc(e.arte) + '" alt="Arte oficial: ' + esc(e.titulo) + '" width="1080" height="1080">'
      : '<div class="ev-data-grande" aria-hidden="true"><span class="dia">' + d.getDate() + '</span><span class="mes">' + S.MESES_LONGOS[d.getMonth()] + '</span><span class="ano">' + d.getFullYear() + '</span></div>';

    var info = [
      ['calendario', 'Data', cap(S.periodoEvento(e))],
      e.horario && ['relogio', 'Horário', e.horario],
      ['pin', 'Local', (e.local || 'A definir') + (e.endereco ? '\n' + e.endereco : '')],
      min && ['pessoas', 'Ministério', min.nome, 'ministerio.html?m=' + encodeURIComponent(min.slug)]
    ].filter(Boolean).map(function (i) {
      var valor = esc(i[2]).replace(/\n/g, '<br><small>') + (i[2].indexOf('\n') > -1 ? '</small>' : '');
      return '<li><span class="ev-info-ic" aria-hidden="true">' + S.icon(i[0]) + '</span><span><strong>' + i[1] + '</strong>' +
        (i[3] ? '<a href="' + i[3] + '">' + valor + '</a>' : valor) + '</span></li>';
    }).join('');

    var outros = S.eventosFuturos().filter(function (x) { return x.id !== e.id; }).slice(0, 3);

    main.innerHTML =
      '<section class="ev-hero" aria-labelledby="ev-titulo">' +
        '<div class="calcadao" aria-hidden="true"></div>' +
        '<div class="container">' +
          '<nav class="migalhas reveal" aria-label="Você está em"><a href="programacoes.html">Programações</a><span aria-hidden="true">/</span>' +
            '<span class="tag esp-tag">' + esc(S.nomeCategoria(cat) || 'Geral') + '</span></nav>' +
          (passou ? '<p class="ev-aviso reveal">Esta programação já aconteceu. <a href="programacoes.html">Ver as próximas</a></p>' : '') +
          '<h1 class="reveal" id="ev-titulo">' + esc(e.titulo) + '</h1>' +
          '<p class="ev-quando reveal">' + S.icon('calendario') + '<span>' + esc(cap(S.periodoEvento(e))) + (e.horario ? ' · ' + esc(e.horario) : '') + '</span></p>' +
        '</div>' +
      '</section>' +

      '<section class="section--tight ev-corpo"><div class="container ev-grid">' +
        '<div class="ev-visual reveal">' + visual + '</div>' +
        '<div class="ev-lado">' +
          '<ul class="ev-info reveal">' + info + '</ul>' +
          (passou ? '' :
          '<div class="ev-acoes reveal">' +
            (e.inscricao ? '<a class="btn btn--mostarda" href="' + esc(e.inscricao) + '" target="_blank" rel="noopener">Fazer inscrição ' + S.icon('diagonal') + '</a>' : '') +
            '<a class="btn" href="' + whats + '" target="_blank" rel="noopener">' + S.icon('whatsapp') + 'Tirar dúvidas no WhatsApp</a>' +
            '<div class="ev-acoes-sec">' +
              '<button class="ev-link" type="button" id="ev-ics">' + S.icon('calendario') + 'Adicionar à agenda</button>' +
              '<button class="ev-link" type="button" id="ev-share">' + S.icon('diagonal') + '<span class="rotulo">Compartilhar</span></button>' +
            '</div>' +
          '</div>') +
          (e.descricao ? '<div class="ev-desc reveal"><h2>Sobre</h2>' + paragrafos(e.descricao) + '</div>' : '') +
        '</div>' +
      '</div></section>' +

      '<section class="section--tight ev-mapa-sec" aria-labelledby="mapa-titulo"><div class="container">' +
        '<div class="ev-mapa-topo">' +
          '<div><p class="eyebrow">Como chegar</p><h2 id="mapa-titulo">' + esc(e.local || 'Local') + '</h2>' +
            '<p class="ev-endereco">' + esc(endereco) + '</p></div>' +
          '<div class="ev-mapa-links">' +
            '<a class="btn btn--ghost" href="' + mapaBusca + '" target="_blank" rel="noopener">Google Maps</a>' +
            '<a class="btn btn--ghost" href="' + waze + '" target="_blank" rel="noopener">Waze</a>' +
          '</div>' +
        '</div>' +
        '<div class="ev-mapa reveal"><iframe title="Mapa: ' + esc(e.local || endereco) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
          'src="https://maps.google.com/maps?q=' + encodeURIComponent(endereco) + '&z=16&output=embed"></iframe></div>' +
      '</div></section>' +

      (outros.length
        ? '<section class="section section--bege" aria-labelledby="outros-titulo"><div class="container">' +
            '<div class="section-head"><div><p class="eyebrow">Agenda</p><h2 id="outros-titulo">Outras programações</h2></div>' +
              '<a class="link-seta" href="programacoes.html">Ver todas ' + S.icon('seta') + '</a></div>' +
            '<div class="eventos-grid" data-stagger>' + outros.map(S.cardEvento).join('') + '</div>' +
          '</div></section>'
        : '');

    var ics = document.getElementById('ev-ics');
    if (ics) ics.addEventListener('click', function () { S.baixarIcs(e); });
    var share = document.getElementById('ev-share');
    if (share) share.addEventListener('click', function () { compartilhar(e, share); });
  });
})();
