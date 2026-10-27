/* ==========================================================================
   IPJC v3 — Blog
   - blog.html: texto mais recente em destaque, filtro por tema, busca e "carregar mais"
   - post.html?p=<id>: leitura com barra de progresso, compartilhar e "leia também"
   ========================================================================== */
(function () {
  'use strict';

  var S = window.IPJCSite;
  var D = window.IPJC;
  var esc = S.esc;
  var POR_PAGINA = 9;

  /* Cor da capa tipográfica, estável por tema */
  var CORES = ['var(--azul)', 'var(--verde)', 'var(--borgonha)', 'var(--azul-profundo)', 'var(--verde-salvia)', 'var(--mostarda-600)'];
  function corDoTema(tag) {
    var h = 0;
    String(tag || '').split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
    return CORES[h % CORES.length];
  }

  function posts() {
    return (D.blog || []).filter(function (p) { return p.id && p.titulo; })
      .sort(function (a, b) { return (b.data || '').localeCompare(a.data || ''); });
  }
  function minutos(p) { return Math.max(1, Math.round(String(p.texto || '').split(/\s+/).length / 200)); }
  function link(p) { return 'post.html?p=' + encodeURIComponent(p.id); }
  function meta(p) {
    return [p.autor && esc(p.autor), p.data && esc(S.dataLonga(p.data)), minutos(p) + ' min de leitura'].filter(Boolean).join(' · ');
  }

  function capa(p, classe) {
    return p.imagem
      ? '<img class="' + classe + '" src="' + esc(p.imagem) + '" alt="" loading="lazy" width="1600" height="900">'
      : '<div class="' + classe + ' capa-tipo" style="--tema:' + corDoTema(p.tag) + '" aria-hidden="true"><span class="capa-aspas">“</span><span class="capa-tag">' + esc(p.tag || 'Blog') + '</span></div>';
  }

  /* ======================================================== Lista */
  function card(p) {
    return '<article class="post-card">' +
      '<a class="post-card-capa" href="' + link(p) + '" tabindex="-1" aria-hidden="true">' + capa(p, 'post-capa') + '</a>' +
      '<div class="post-card-corpo">' +
        (p.tag ? '<span class="post-tag" style="--tema:' + corDoTema(p.tag) + '">' + esc(p.tag) + '</span>' : '') +
        '<h3><a href="' + link(p) + '">' + esc(p.titulo) + '</a></h3>' +
        (p.resumo ? '<p class="post-resumo">' + esc(p.resumo) + '</p>' : '') +
        '<p class="post-meta">' + meta(p) + '</p>' +
      '</div>' +
    '</article>';
  }

  function paginaLista() {
    var todos = posts();
    var lista = document.getElementById('blog-lista');
    var tagsEl = document.getElementById('blog-tags');
    var busca = document.getElementById('blog-busca');
    var mais = document.getElementById('blog-mais');
    var status = document.getElementById('blog-status');

    if (!todos.length) {
      tagsEl.hidden = true;
      busca.closest('.busca').hidden = true;
      lista.innerHTML = '<p class="vazio">Os primeiros textos serão publicados aqui em breve.</p>';
      return;
    }

    /* destaque */
    var d = todos[0];
    document.getElementById('blog-destaque-sec').hidden = false;
    document.getElementById('blog-destaque').innerHTML =
      '<article class="post-destaque reveal">' +
        '<a class="post-destaque-capa" href="' + link(d) + '" tabindex="-1" aria-hidden="true">' + capa(d, 'post-capa') + '</a>' +
        '<div class="post-destaque-texto">' +
          '<p class="eyebrow">Mais recente</p>' +
          (d.tag ? '<span class="post-tag" style="--tema:' + corDoTema(d.tag) + '">' + esc(d.tag) + '</span>' : '') +
          '<h2><a href="' + link(d) + '">' + esc(d.titulo) + '</a></h2>' +
          (d.subtitulo ? '<p class="post-sub">' + esc(d.subtitulo) + '</p>' : '') +
          '<p class="post-meta">' + meta(d) + '</p>' +
          '<a class="btn" href="' + link(d) + '">Ler texto ' + S.icon('seta') + '</a>' +
        '</div>' +
      '</article>';

    var tags = todos.map(function (p) { return p.tag; }).filter(function (t, i, a) { return t && a.indexOf(t) === i; }).sort();
    tagsEl.innerHTML = ['Todos'].concat(tags).map(function (t, i) {
      return '<button type="button" class="filtro" data-tag="' + (i ? esc(t) : '') + '" aria-pressed="' + (i ? 'false' : 'true') + '">' + esc(t) + '</button>';
    }).join('');
    if (tags.length < 2) tagsEl.hidden = true;

    var tagAtual = '', limite = POR_PAGINA;
    function normal(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

    function desenhar() {
      var q = normal(busca.value.trim());
      var vis = todos.filter(function (p) {
        if (tagAtual && p.tag !== tagAtual) return false;
        return !q || normal([p.titulo, p.subtitulo, p.autor, p.tag, p.resumo].join(' ')).indexOf(q) > -1;
      });
      lista.innerHTML = vis.length
        ? vis.slice(0, limite).map(card).join('')
        : '<p class="vazio">Nenhum texto encontrado' + (q ? ' para “' + esc(busca.value.trim()) + '”' : '') + '.</p>';
      mais.hidden = vis.length <= limite;
      status.textContent = vis.length + (vis.length === 1 ? ' texto encontrado' : ' textos encontrados');
    }

    tagsEl.addEventListener('click', function (ev) {
      var b = ev.target.closest('.filtro');
      if (!b) return;
      tagAtual = b.getAttribute('data-tag');
      limite = POR_PAGINA;
      Array.prototype.forEach.call(tagsEl.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      desenhar();
    });
    var espera;
    busca.addEventListener('input', function () { clearTimeout(espera); espera = setTimeout(function () { limite = POR_PAGINA; desenhar(); }, 150); });
    mais.addEventListener('click', function () { limite += POR_PAGINA; desenhar(); });
    desenhar();
  }

  /* ======================================================== Post */
  function paginaPost() {
    var main = document.getElementById('conteudo');
    var todos = posts();
    var id = new URLSearchParams(location.search).get('p');
    var p = todos.filter(function (x) { return x.id === id; })[0];

    if (!p) {
      document.title = 'Texto não encontrado — IPJC';
      main.innerHTML =
        '<section class="page-hero"><div class="container">' +
          '<p class="eyebrow">Blog</p><h1>Texto não encontrado</h1>' +
          '<p class="page-lead">Ele pode ter sido removido ou o endereço mudou.</p>' +
          '<p style="margin-top:28px"><a class="btn" href="blog.html">Ver todos os textos</a></p>' +
        '</div></section>';
      return;
    }

    document.title = p.titulo + ' — Blog IPJC';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', p.resumo || p.subtitulo || p.titulo);

    var i = todos.indexOf(p);
    var maisNovo = todos[i - 1], maisAntigo = todos[i + 1];
    var relacionados = todos.filter(function (x) { return x !== p; })
      .sort(function (a, b) { return (b.tag === p.tag) - (a.tag === p.tag); })
      .slice(0, 3);
    var url = location.href;
    var whats = 'https://wa.me/?text=' + encodeURIComponent(p.titulo + ' — ' + url);

    main.innerHTML =
      '<article class="post" style="--tema:' + corDoTema(p.tag) + '">' +
        '<header class="post-hero">' +
          '<div class="container post-estreito">' +
            '<nav class="migalhas reveal" aria-label="Você está em"><a href="blog.html">Blog</a>' +
              (p.tag ? '<span aria-hidden="true">/</span><span class="post-tag">' + esc(p.tag) + '</span>' : '') + '</nav>' +
            '<h1 class="reveal">' + esc(p.titulo) + '</h1>' +
            (p.subtitulo ? '<p class="post-sub reveal">' + esc(p.subtitulo) + '</p>' : '') +
            '<p class="post-meta reveal">' + meta(p) + '</p>' +
          '</div>' +
        '</header>' +
        (p.imagem ? '<div class="container post-largo"><img class="post-imagem reveal" src="' + esc(p.imagem) + '" alt="" width="1600" height="900"></div>' : '') +
        '<div class="container post-estreito">' +
          '<div class="post-texto" id="post-texto">' + S.formatarTexto(p.texto) + '</div>' +
          '<footer class="post-rodape">' +
            '<p>Gostou? Compartilhe:</p>' +
            '<div class="post-share">' +
              '<a class="btn btn--ghost" href="' + whats + '" target="_blank" rel="noopener">' + S.icon('whatsapp') + 'WhatsApp</a>' +
              '<button class="btn btn--ghost" type="button" id="post-copiar">' + S.icon('diagonal') + '<span class="rotulo">Copiar link</span></button>' +
            '</div>' +
          '</footer>' +
          '<nav class="mi-pager post-pager" aria-label="Navegar entre textos">' +
            (maisAntigo ? '<a href="' + link(maisAntigo) + '" rel="prev"><span>Anterior</span>' + esc(maisAntigo.titulo) + '</a>' : '<span></span>') +
            (maisNovo ? '<a href="' + link(maisNovo) + '" rel="next"><span>Próximo</span>' + esc(maisNovo.titulo) + '</a>' : '') +
          '</nav>' +
        '</div>' +
      '</article>' +
      (relacionados.length
        ? '<section class="section section--bege" aria-labelledby="rel-titulo"><div class="container">' +
            '<div class="section-head"><div><p class="eyebrow">Continue lendo</p><h2 id="rel-titulo">Leia também</h2></div>' +
              '<a class="link-seta" href="blog.html">Todos os textos ' + S.icon('seta') + '</a></div>' +
            '<div class="posts-grid" data-stagger>' + relacionados.map(card).join('') + '</div>' +
          '</div></section>'
        : '');

    document.getElementById('post-copiar').addEventListener('click', function () {
      var r = this.querySelector('.rotulo');
      var ok = function () { r.textContent = 'Link copiado!'; setTimeout(function () { r.textContent = 'Copiar link'; }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok); else window.prompt('Copie o link:', url);
    });

    /* barra de progresso da leitura */
    var barra = document.getElementById('leitura-barra');
    var texto = document.getElementById('post-texto');
    var agendado = false;
    function progresso() {
      agendado = false;
      var r = texto.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var feito = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(total, 1)));
      barra.style.transform = 'scaleX(' + feito.toFixed(3) + ')';
    }
    window.addEventListener('scroll', function () { if (!agendado) { agendado = true; requestAnimationFrame(progresso); } }, { passive: true });
    progresso();
  }

  S.registrarPagina('blog', paginaLista);
  S.registrarPagina('post', paginaPost);
})();
