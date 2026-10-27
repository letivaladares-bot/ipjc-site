/* ==========================================================================
   IPJC v3 — Congregações
   - congregacoes.html: cards com foto
   - congregacao.html?c=<slug>: foto, endereço com mapa, pastor, telefone
     clicável, Instagram, programação (tipo em negrito) e história
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;

  function link(c) { return 'congregacao.html?c=' + encodeURIComponent(c.slug); }
  function instagramUrl(arroba) { return 'https://www.instagram.com/' + String(arroba || '').replace(/^@/, '') + '/'; }
  function siteCurto(url) { return String(url || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); }
  function mapaUrl(end) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(end); }

  /* Foto da congregação, ou espaço reservado com a logo enquanto não houver foto */
  function foto(c, classe) {
    if (c.foto) return '<img class="' + classe + '" src="' + esc(c.foto) + '" alt="' + esc(c.nome) + '" loading="lazy" width="1600" height="1000">';
    return '<div class="' + classe + ' cong-foto--vazia" role="img" aria-label="Espaço para a foto da ' + esc(c.nome) + '">' +
      (c.logo ? '<img src="' + esc(c.logo) + '" alt="" loading="lazy">' : '') +
    '</div>';
  }

  /* ======================================================== Lista */
  function paginaLista() {
    var alvo = document.getElementById('cong-lista');
    alvo.innerHTML = D.congregacoes.map(function (c) {
      return '<article class="cong-card">' +
        '<a class="cong-card-foto" href="' + link(c) + '" tabindex="-1" aria-hidden="true">' + foto(c, 'cong-foto') + '</a>' +
        '<div class="cong-card-corpo">' +
          '<p class="cong-cidade">' + S.icon('pin') + esc(c.cidade) + '</p>' +
          '<h2><a href="' + link(c) + '">' + esc(c.nome) + '</a></h2>' +
          '<p class="cong-resumo">' + esc(c.resumo) + '</p>' +
          '<ul class="cong-dados">' +
            '<li>' + S.icon('pessoas') + '<span>' + esc(c.pastor) + '</span></li>' +
            '<li>' + S.icon('telefone') + '<a href="' + S.linkTel(c.telefone) + '">' + esc(c.telefone) + '</a></li>' +
            '<li>' + S.icon('instagram') + '<a href="' + instagramUrl(c.instagram) + '" target="_blank" rel="noopener">' + esc(c.instagram) + '</a></li>' +
            (c.site ? '<li>' + S.icon('diagonal') + '<a href="' + esc(c.site) + '" target="_blank" rel="noopener">' + esc(siteCurto(c.site)) + '</a></li>' : '') +
          '</ul>' +
          '<a class="btn" href="' + link(c) + '">Conhecer ' + S.icon('seta') + '</a>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ======================================================== Individual */
  function paginaIndividual() {
    var main = document.getElementById('conteudo');
    var slug = new URLSearchParams(location.search).get('c');
    var c = D.congregacoes.filter(function (x) { return x.slug === slug; })[0];

    if (!c) {
      document.title = 'Congregação não encontrada — IPJC';
      main.innerHTML =
        '<section class="page-hero"><div class="container">' +
          '<p class="eyebrow">Congregações</p><h1>Congregação não encontrada</h1>' +
          '<p class="page-lead">O endereço pode ter mudado.</p>' +
          '<p style="margin-top:28px"><a class="btn" href="congregacoes.html">Ver congregações</a></p>' +
        '</div></section>';
      return;
    }

    document.title = c.nome + ' — IPJC · Igreja Presbiteriana em Jardim Camburi';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', c.nome + ' (' + c.cidade + '). ' + c.resumo);

    var programas = (c.programas || []).length
      ? '<ul class="cong-programas">' + c.programas.map(function (p) {
          return '<li><strong>' + esc(p.tipo) + '</strong><span>' + esc(p.descricao) + '</span></li>';
        }).join('') + '</ul>'
      : '<p class="cong-sem-prog">Para saber os dias e horários, fale com a congregação pelo telefone ou acompanhe o Instagram.</p>';

    var outras = D.congregacoes.filter(function (x) { return x !== c; });

    main.innerHTML =
      '<section class="cong-hero" aria-labelledby="cong-titulo">' +
        '<div class="calcadao" aria-hidden="true"></div>' +
        '<div class="container">' +
          '<nav class="migalhas reveal" aria-label="Você está em"><a href="congregacoes.html">Congregações</a><span aria-hidden="true">/</span><span>' + esc(c.cidade) + '</span></nav>' +
          (c.logo ? '<div class="cong-logo reveal"><img src="' + esc(c.logo) + '" alt="Logo da ' + esc(c.nome) + '"></div>' : '') +
          '<h1 class="reveal" id="cong-titulo">' + esc(c.nome) + '</h1>' +
          '<p class="page-lead reveal">' + esc(c.resumo) + '</p>' +
          (c.lema ? '<p class="cong-lema reveal">' + esc(c.lema) + '</p>' : '') +
        '</div>' +
      '</section>' +

      '<section class="section--tight cong-foto-sec"><div class="container">' +
        '<div class="reveal">' + foto(c, 'cong-foto cong-foto--grande') + '</div>' +
      '</div></section>' +

      '<section class="section--tight"><div class="container cong-detalhe">' +
        '<div class="cong-texto">' +
          '<h2 class="reveal">Programação</h2>' +
          '<div class="reveal">' + programas + '</div>' +
          (c.versiculo ? '<blockquote class="cong-versiculo reveal"><p>“' + esc(c.versiculo.texto) + '”</p><cite>' + esc(c.versiculo.ref) + '</cite></blockquote>' : '') +
          (c.historia || (c.marcos || []).length ? '<h2 class="reveal">Nossa caminhada juntos</h2>' : '') +
          (c.historia ? '<p class="reveal">' + esc(c.historia) + '</p>' : '') +
          ((c.marcos || []).length
            ? '<ol class="cong-marcos" data-stagger>' + c.marcos.map(function (m) {
                return '<li><span class="cong-marco-quando">' + esc(m.quando) + '</span><p>' + esc(m.texto) + '</p></li>';
              }).join('') + '</ol>'
            : '') +
        '</div>' +
        '<aside class="cong-info reveal" aria-label="Contato e endereço">' +
          '<ul>' +
            '<li><span class="cong-info-ic" aria-hidden="true">' + S.icon('pin') + '</span><span><strong>Endereço</strong><a href="' + mapaUrl(c.endereco) + '" target="_blank" rel="noopener">' + esc(c.endereco) + '</a></span></li>' +
            '<li><span class="cong-info-ic" aria-hidden="true">' + S.icon('pessoas') + '</span><span><strong>Pastor</strong>' + esc(c.pastor) + '</span></li>' +
            '<li><span class="cong-info-ic" aria-hidden="true">' + S.icon('telefone') + '</span><span><strong>Telefone</strong><a href="' + S.linkTel(c.telefone) + '">' + esc(c.telefone) + '</a></span></li>' +
            '<li><span class="cong-info-ic" aria-hidden="true">' + S.icon('instagram') + '</span><span><strong>Instagram</strong><a href="' + instagramUrl(c.instagram) + '" target="_blank" rel="noopener">' + esc(c.instagram) + '</a></span></li>' +
            (c.email ? '<li><span class="cong-info-ic" aria-hidden="true">' + S.icon('email') + '</span><span><strong>E-mail</strong><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></span></li>' : '') +
            (c.site ? '<li><span class="cong-info-ic" aria-hidden="true">' + S.icon('diagonal') + '</span><span><strong>Site</strong><a href="' + esc(c.site) + '" target="_blank" rel="noopener">' + esc(siteCurto(c.site)) + '</a></span></li>' : '') +
          '</ul>' +
          '<a class="btn cong-ligar" href="' + S.linkTel(c.telefone) + '">' + S.icon('telefone') + 'Ligar para a congregação</a>' +
        '</aside>' +
      '</div></section>' +

      ((c.galeria || []).length
        ? '<section class="section--tight cong-galeria-sec" aria-labelledby="galeria-titulo"><div class="container">' +
            '<h2 class="cong-galeria-titulo reveal" id="galeria-titulo">Fotos</h2>' +
            '<ul class="cong-galeria" data-stagger>' + c.galeria.map(function (g, i) {
              return '<li><button type="button" class="cong-galeria-btn" data-foto="' + i + '" aria-label="Ampliar foto: ' + esc(g.legenda) + '">' +
                '<img src="' + esc(g.src) + '" alt="' + esc(g.legenda) + '" loading="lazy"><span>' + esc(g.legenda) + '</span></button></li>';
            }).join('') + '</ul>' +
          '</div></section>'
        : '') +

      '<section class="section--tight cong-mapa-sec" aria-labelledby="mapa-titulo"><div class="container">' +
        '<div class="ev-mapa-topo"><div><p class="eyebrow">Como chegar</p><h2 id="mapa-titulo">' + esc(c.cidade) + '</h2><p class="ev-endereco">' + esc(c.endereco) + '</p></div>' +
          '<div class="ev-mapa-links">' +
            '<a class="btn btn--ghost" href="' + mapaUrl(c.endereco) + '" target="_blank" rel="noopener">Google Maps</a>' +
            '<a class="btn btn--ghost" href="https://waze.com/ul?q=' + encodeURIComponent(c.endereco) + '&navigate=yes" target="_blank" rel="noopener">Waze</a>' +
          '</div></div>' +
        '<div class="ev-mapa reveal"><iframe title="Mapa: ' + esc(c.nome) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(c.endereco) + '&z=15&output=embed"></iframe></div>' +
      '</div></section>' +

      (outras.length
        ? '<section class="section section--bege" aria-labelledby="outras-titulo"><div class="container">' +
            '<div class="section-head"><div><p class="eyebrow">Conheça também</p><h2 id="outras-titulo">' + (outras.length === 1 ? 'Outra congregação' : 'Outras congregações') + '</h2></div></div>' +
            '<div class="cong-mini-lista">' + outras.map(function (o) {
              return '<a class="cong-mini" href="' + link(o) + '">' + foto(o, 'cong-foto') +
                '<span><small>' + esc(o.cidade) + '</small><strong>' + esc(o.nome) + '</strong></span>' + S.icon('seta') + '</a>';
            }).join('') + '</div>' +
          '</div></section>'
        : '');
  }

  /* Foto ampliada (galeria) com setas e teclado */
  function initGaleria(fotos) {
    var lista = document.querySelector('.cong-galeria');
    if (!lista) return;
    var caixa = document.createElement('div');
    caixa.className = 'cong-lightbox'; caixa.hidden = true;
    caixa.setAttribute('role', 'dialog'); caixa.setAttribute('aria-modal', 'true'); caixa.setAttribute('aria-label', 'Foto ampliada');
    caixa.innerHTML = '<button type="button" class="lb-fechar" aria-label="Fechar">×</button>' +
      '<button type="button" class="lb-nav lb-ant" aria-label="Foto anterior">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-nav lb-prox" aria-label="Próxima foto">›</button>';
    document.body.appendChild(caixa);
    var atual = 0, origem = null;
    function mostrar(i) {
      atual = (i + fotos.length) % fotos.length;
      caixa.querySelector('img').src = fotos[atual].src;
      caixa.querySelector('img').alt = fotos[atual].legenda;
      caixa.querySelector('figcaption').textContent = fotos[atual].legenda + ' · ' + (atual + 1) + '/' + fotos.length;
    }
    function fechar() { caixa.hidden = true; document.body.style.overflow = ''; if (origem) origem.focus(); }
    lista.addEventListener('click', function (e) {
      var b = e.target.closest('[data-foto]');
      if (!b) return;
      origem = b; mostrar(+b.getAttribute('data-foto'));
      caixa.hidden = false; document.body.style.overflow = 'hidden';
      caixa.querySelector('.lb-fechar').focus();
    });
    caixa.addEventListener('click', function (e) {
      if (e.target.closest('.lb-ant')) mostrar(atual - 1);
      else if (e.target.closest('.lb-prox')) mostrar(atual + 1);
      else if (e.target === caixa || e.target.closest('.lb-fechar')) fechar();
    });
    document.addEventListener('keydown', function (e) {
      if (caixa.hidden) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowLeft') mostrar(atual - 1);
      if (e.key === 'ArrowRight') mostrar(atual + 1);
    });
  }

  S.registrarPagina('congregacoes', paginaLista);
  S.registrarPagina('congregacao', function () {
    paginaIndividual();
    var c = D.congregacoes.filter(function (x) { return x.slug === new URLSearchParams(location.search).get('c'); })[0];
    if (c && c.galeria) initGaleria(c.galeria);
  });
})();
