/* ==========================================================================
   IPJC v3 — Script principal
   Lê o objeto global IPJC (dados.js) e renderiza as partes compartilhadas
   (header, rodapé) e o conteúdo de cada página, conforme <body data-page>.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.IPJC;
  document.documentElement.classList.add('js');

  /* ------------------------------------------------------------ Utilitários */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Lê um caminho como "contato.telefone" dentro de IPJC */
  function get(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, D);
  }

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  /* "AAAA-MM-DD" → Date local (evita o deslocamento de fuso do parse UTC) */
  function parseData(s) {
    if (!s) return null;
    var p = String(s).split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function hoje() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function dataLonga(s) {
    var d = parseData(s);
    return d ? d.getDate() + ' de ' + MESES_LONGOS[d.getMonth()] + ' de ' + d.getFullYear() : '';
  }

  /* Programações cuja data (ou data final) ainda não passou, em ordem */
  function eventosFuturos() {
    var h = hoje();
    return (D.programacoes || [])
      .filter(function (e) { var fim = parseData(e.dataFim || e.data); return fim && fim >= h; })
      .sort(function (a, b) { return parseData(a.data) - parseData(b.data); });
  }

  function soDigitos(s) { return String(s || '').replace(/\D/g, ''); }
  function linkTel(tel) { return 'tel:+55' + soDigitos(tel); }
  function linkWhats(tel) { return 'https://wa.me/55' + soDigitos(tel); }

  function nomeCategoria(id) {
    var c = (D.categorias || []).filter(function (c) { return c.id === id; })[0];
    return c ? c.nome : '';
  }
  var COR_CATEGORIA = { geral: '', sociedades: 'tag--verde', ministerios: '', adoracao: 'tag--mostarda', ensino: 'tag--verde', missoes: 'tag--borgonha' };

  /* ------------------------------------------------------------ Eventos */
  var DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  function chaveData(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* "domingo, 6 de dezembro de 2026" ou "6 a 8 de dezembro de 2026" */
  function periodoEvento(e) {
    var d = parseData(e.data);
    if (!e.dataFim || e.dataFim === e.data) return DIAS_SEMANA[d.getDay()] + ', ' + dataLonga(e.data);
    var f = parseData(e.dataFim);
    var inicio = d.getDate() + (d.getMonth() === f.getMonth() ? '' : ' de ' + MESES_LONGOS[d.getMonth()]);
    return inicio + ' a ' + dataLonga(e.dataFim);
  }

  /* Endereço usado no mapa: o informado, ou o da igreja quando o local é o templo */
  function enderecoEvento(e) {
    if (e.endereco) return e.endereco;
    var end = D.igreja.endereco;
    if (!e.local || /templo|ipjc/i.test(e.local)) return end.rua + ', ' + end.bairro + ', ' + end.cidade + ' - ' + end.uf;
    return e.local;
  }

  function linkEvento(e) { return 'evento.html?e=' + encodeURIComponent(e.id); }

  /* Arquivo .ics para adicionar à agenda (Google, iPhone, Outlook) */
  function icsEscape(t) { return String(t || '').replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n'); }
  function baixarIcs(e) {
    var d = parseData(e.data);
    var fim = parseData(e.dataFim || e.data);
    var ymd = function (x) { return chaveData(x).replace(/-/g, ''); };
    var hora = /(\d{1,2})h(\d{2})?/.exec(e.horario || '');
    var linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IPJC//Site//PT', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + e.id + '@ipjc.org.br',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')];
    if (hora) {
      var ini = new Date(d); ini.setHours(+hora[1], +(hora[2] || 0));
      var ter = new Date(fim); ter.setHours(+hora[1] + 2, +(hora[2] || 0));
      var hm = function (x) { return ymd(x) + 'T' + String(x.getHours()).padStart(2, '0') + String(x.getMinutes()).padStart(2, '0') + '00'; };
      linhas.push('DTSTART:' + hm(ini), 'DTEND:' + hm(ter));
    } else {
      var depois = new Date(fim); depois.setDate(depois.getDate() + 1);
      linhas.push('DTSTART;VALUE=DATE:' + ymd(d), 'DTEND;VALUE=DATE:' + ymd(depois));
    }
    linhas.push('SUMMARY:' + icsEscape(e.titulo), 'LOCATION:' + icsEscape(enderecoEvento(e)),
      'DESCRIPTION:' + icsEscape(e.descricao + (e.horario ? '\nHorário: ' + e.horario : '')),
      'END:VEVENT', 'END:VCALENDAR');
    var url = URL.createObjectURL(new Blob([linhas.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = e.id + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ------------------------------------------------------------ Ícones */
  var I = {
    chama: '<path d="M12 3c.8 2.6 4 4.4 4 8.2a4 4 0 0 1-8 0c0-1.8.9-3 2-4 .1 1.6.8 2.6 2 2.8-.4-2.6-.9-4.6 0-7z"/><path d="M8 21h8"/><path d="M12 17.5V21"/>',
    doar: '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.9l-4.2 3.9"/><path d="m2 15 6 6"/><circle cx="16" cy="5" r="2.5"/>',
    globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>',
    enviar: '<path d="M21.5 2.5 10.5 13.5"/><path d="M21.5 2.5 14.5 21.5l-4-8-8-4 19-7z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    youtube: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    spotify: '<circle cx="12" cy="12" r="10"/><path d="M7 9.6c3.4-1 7.2-.7 10 .9M7.6 12.7c2.8-.8 5.8-.5 8.2.8M8.3 15.6c2.1-.6 4.3-.4 6.1.6"/>',
    whatsapp: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.4-2-1.4-2.4-2.4l1-1-1-2L9 9.5"/>',
    telefone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    relogio: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    seta: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    diagonal: '<path d="M7 17 17 7M7 7h10v10"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    crianca: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    pessoas: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    coracao: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    broto: '<path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    fone: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    igreja: '<path d="M10 9h4M12 7v5M14 22v-4a2 2 0 0 0-4 0v4M18 22V5.6a1 1 0 0 0-.6-.9l-4.5-2.3a2 2 0 0 0-1.8 0L6.6 4.7a1 1 0 0 0-.6.9V22M18 9l3.5 2.1a1 1 0 0 1 .5.9V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a1 1 0 0 1 .5-.9L6 9"/>',
    play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>',
    email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    livro: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    trindade: '<path d="M12 3 21.5 19.5h-19Z"/><circle cx="12" cy="13.6" r="3.2"/>',
    coroa: '<path d="M2.5 8 6 18h12l3.5-10-6 4L12 5l-3.5 7z"/><path d="M6 21h12"/>',
    calice: '<path d="M7 3h10l-.8 6.5a4.2 4.2 0 0 1-8.4 0Z"/><path d="M12 14v7M8 21h8"/>',
    sol: '<path d="M12 2v5M4.9 9.9l1.4 1.4M2 17h2M20 17h2M17.7 11.3l1.4-1.4M22 21H2M16 17a4 4 0 0 0-8 0"/><path d="m9 5 3-3 3 3"/>'
  };
  function icon(nome, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + I[nome] + '</svg>';
  }

  /* Links externos abrem em nova aba; placeholders "#" ficam inertes */
  function attrsExterno(url) {
    return 'href="' + esc(url || '#') + '"' + (url && url !== '#' ? ' target="_blank" rel="noopener"' : '');
  }

  /* ------------------------------------------------------------ Texto formatado (blog)
     O texto é guardado como texto simples com marcações; tudo é escapado antes,
     então nenhuma marcação vira HTML livre. Blocos são separados por linha em branco.
       ## Subtítulo · ### Título menor · > Citação · - item · 1. item · ---
       [destaque] texto · [centro] texto · [espaço]
       **negrito** · *itálico* · ==marca-texto== · [texto](https://link)
       {sans}Poppins{/sans} · {manuscrita}Caveat{/manuscrita}  (só fontes da identidade) */
  function formatarTexto(texto) {
    function inline(t) {
      return t
        .replace(/\{sans\}([\s\S]+?)\{\/sans\}/g, '<span class="txt-sans">$1</span>')
        .replace(/\{manuscrita\}([\s\S]+?)\{\/manuscrita\}/g, '<span class="txt-manuscrita">$1</span>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/==(.+?)==/g, '<mark>$1</mark>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }
    function linhas(b) { return inline(b).replace(/\n/g, '<br>'); }
    return String(texto || '').replace(/\r/g, '').split(/\n\s*\n/).map(function (bloco) {
      var b = esc(bloco.trim());
      if (!b) return '';
      var ls = b.split('\n');
      if (/^-{3,}$/.test(b)) return '<hr>';
      if (/^\[espaço\]$/i.test(b)) return '<div class="txt-espaco" aria-hidden="true"></div>';
      if (/^###\s+/.test(b)) return '<h3>' + inline(b.replace(/^###\s+/, '')) + '</h3>';
      if (/^##\s+/.test(b)) return '<h2>' + inline(b.replace(/^##\s+/, '')) + '</h2>';
      if (/^&gt;\s?/.test(b)) return '<blockquote><p>' + linhas(b.replace(/^&gt;\s?/gm, '')) + '</p></blockquote>';
      if (/^\[destaque\]\s*/i.test(b)) return '<aside class="txt-destaque"><p>' + linhas(b.replace(/^\[destaque\]\s*/i, '')) + '</p></aside>';
      if (/^\[centro\]\s*/i.test(b)) return '<p class="txt-centro">' + linhas(b.replace(/^\[centro\]\s*/i, '')) + '</p>';
      if (ls.every(function (l) { return /^[-•]\s+/.test(l); }))
        return '<ul>' + ls.map(function (l) { return '<li>' + inline(l.replace(/^[-•]\s+/, '')) + '</li>'; }).join('') + '</ul>';
      if (ls.every(function (l) { return /^\d+[.)]\s+/.test(l); }))
        return '<ol>' + ls.map(function (l) { return '<li>' + inline(l.replace(/^\d+[.)]\s+/, '')) + '</li>'; }).join('') + '</ol>';
      return '<p>' + linhas(b) + '</p>';
    }).join('');
  }

  /* Prévia no GitHub Pages: não indexar (o site oficial fica no domínio da igreja) */
  if (/\.github\.io$/.test(location.hostname)) {
    var robots = document.createElement('meta');
    robots.name = 'robots'; robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
  }

  /* ------------------------------------------------------------ Navegação */
  var MENU = [
    ['quem-somos.html', 'Quem Somos'],
    ['no-que-cremos.html', 'No que Cremos'],
    ['ministerios.html', 'Ministérios'],
    ['pequenos-grupos.html', 'Pequenos Grupos'],
    ['congregacoes.html', 'Congregações'],
    ['programacoes.html', 'Programações'],
    ['boletins.html', 'Boletins'],
    ['blog.html', 'Blog'],
    ['social.html', 'Social'],
    ['contato.html', 'Contato']
  ];
  /* Atalhos da barra superior (e do menu no celular) */
  var ATALHOS = [
    ['contribua.html', 'Dízimos e ofertas'],
    ['plano-leitura.html', 'Plano de leitura'],
    ['membro.html', 'Quero ser membro']
  ];
  /* Páginas internas que destacam um item do menu */
  var MENU_PAI = { 'ministerio.html': 'ministerios.html', 'evento.html': 'programacoes.html', 'post.html': 'blog.html', 'congregacao.html': 'congregacoes.html' };

  function paginaAtual() {
    var arq = location.pathname.split('/').pop() || 'index.html';
    return MENU_PAI[arq] || arq;
  }

  function renderHeader() {
    var alvo = $('#site-header');
    if (!alvo) return;
    var atual = paginaAtual();
    var itens = MENU.map(function (m) {
      return '<li><a href="' + m[0] + '"' + (m[0] === atual ? ' aria-current="page"' : '') + '>' + m[1] + '</a></li>';
    }).join('');

    var atalhos = ATALHOS.map(function (m) {
      return '<li><a href="' + m[0] + '"' + (m[0] === atual ? ' aria-current="page"' : '') + '>' + m[1] + '</a></li>';
    }).join('');

    alvo.outerHTML =
      '<div class="topbar"><div class="container"><span class="topbar-txt">' + esc(D.cultos.resumo) + ' · ' + esc(D.cultos.ebd.replace('EBD · dom · ', 'EBD ')) + '</span>' +
        '<ul class="topbar-links" aria-label="Atalhos">' +
          '<li><a class="topbar-live" ' + attrsExterno(D.redes.youtube) + ' aria-label="Assistir ao vivo no YouTube"><span class="dot" aria-hidden="true"></span>Ao Vivo</a></li>' +
          atalhos + '</ul></div></div>' +
      '<header class="site-header" id="topo">' +
        '<div class="container">' +
          '<a class="brand" href="index.html" aria-label="Igreja Presbiteriana em Jardim Camburi — página inicial">' +
            '<img src="assets/img/logo/ipjc-logo.svg" alt="Igreja Presbiteriana em Jardim Camburi" width="170" height="46">' +
          '</a>' +
          '<nav class="nav" id="nav" aria-label="Menu principal"><ul>' + itens + '</ul>' +
            '<ul class="nav-sec">' + atalhos + '</ul></nav>' +
          '<a class="btn-live" ' + attrsExterno(D.redes.youtube) + ' aria-label="Assistir ao vivo no YouTube"><span class="dot" aria-hidden="true"></span>Ao Vivo</a>' +
          '<button class="nav-toggle" type="button" aria-controls="nav" aria-expanded="false" aria-label="Abrir menu"><span></span></button>' +
        '</div>' +
      '</header>';

    var header = $('.site-header');
    var toggle = $('.nav-toggle');
    function fechar() {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    }
    toggle.addEventListener('click', function () {
      var aberto = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(aberto));
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', fechar); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
    window.matchMedia('(min-width: 1260px)').addEventListener('change', function (m) { if (m.matches) fechar(); });

    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function renderFooter() {
    var alvo = $('#site-footer');
    if (!alvo) return;
    var ig = D.igreja, c = D.contato, r = D.redes;
    var social = [
      ['instagram', 'Instagram', r.instagram],
      ['facebook', 'Facebook', r.facebook],
      ['youtube', 'YouTube', r.youtube],
      ['spotify', 'Spotify', r.spotify]
    ].map(function (s) {
      return '<a ' + attrsExterno(s[2]) + ' aria-label="' + s[1] + '">' + icon(s[0]) + '</a>';
    }).join('');

    alvo.outerHTML =
      '<footer class="site-footer">' +
        '<div class="container footer-main">' +
          '<div class="footer-brand">' +
            '<img class="footer-logo" src="assets/img/logo/ipjc-bege.png" alt="Igreja Presbiteriana em Jardim Camburi" width="230" height="62">' +
            '<p>' + esc(ig.nomeCompleto) + '. Uma igreja reformada, firmada na Palavra que não passa.</p>' +
            '<div class="social-links">' + social + '</div>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h2>Visite-nos</h2>' +
            '<address><a ' + attrsExterno(ig.endereco.mapa) + '>' + esc(ig.endereco.rua) + '<br>' + esc(ig.endereco.bairro + ', ' + ig.endereco.cidade + '/' + ig.endereco.uf) + '</a></address>' +
            '<p style="margin:12px 0 0">' + esc(D.cultos.resumo) + '<br>' + esc(D.cultos.ebd) + '</p>' +
            '<div class="footer-contato-linha">' +
              (c.telefone ? '<a href="' + linkTel(c.telefone) + '">' + icon('telefone') + esc(c.telefone) + '</a>' : '') +
              '<a ' + attrsExterno(linkWhats(c.whatsapp)) + ' aria-label="WhatsApp ' + esc(c.whatsapp) + '">' + icon('whatsapp') + esc(c.whatsapp) + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-col"><h2>A igreja</h2><ul>' +
            '<li><a href="quem-somos.html">Quem Somos</a></li>' +
            '<li><a href="no-que-cremos.html">No que Cremos</a></li>' +
            '<li><a href="ministerios.html">Ministérios</a></li>' +
            '<li><a href="pequenos-grupos.html">Pequenos grupos</a></li>' +
            '<li><a href="congregacoes.html">Congregações</a></li>' +
            '<li><a href="social.html">Social</a></li>' +
          '</ul></div>' +
          '<div class="footer-col"><h2>Acompanhe</h2><ul>' +
            '<li><a href="programacoes.html">Programações</a></li>' +
            '<li><a href="boletins.html">Boletins</a></li>' +
            '<li><a href="blog.html">Blog</a></li>' +
            '<li><a href="plano-leitura.html">Plano de leitura</a></li>' +
            '<li><a href="contribua.html">Dízimos e ofertas</a></li>' +
            '<li><a href="contato.html">Contato</a></li>' +
            '<li><a href="membro.html">Quero ser membro</a></li>' +
            '<li><a href="privacidade.html">Política de Privacidade</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="container footer-bottom">' +
          '<p>© ' + new Date().getFullYear() + ' ' + esc(ig.nomeCompleto) + ' · CNPJ ' + esc(ig.cnpj) + '</p>' +
          '<p><a href="privacidade.html">Política de Privacidade</a></p>' +
        '</div>' +
      '</footer>';
  }

  /* Liga elementos a dados: data-ipjc="contato.telefone" (texto),
     data-ipjc-href="redes.spotify" (link externo) */
  function bindDados(ctx) {
    $$('[data-ipjc]', ctx).forEach(function (el) {
      var v = get(el.getAttribute('data-ipjc'));
      if (v != null) el.textContent = v;
    });
    $$('[data-ipjc-href]', ctx).forEach(function (el) {
      var v = get(el.getAttribute('data-ipjc-href'));
      if (!v) return;
      el.setAttribute('href', v);
      if (v !== '#' && /^https?:/.test(v)) { el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ------------------------------------------------------------ Reveal */
  var observer = null;
  function initReveal(ctx) {
    var els = $$('.reveal:not(.is-visible)', ctx);
    /* atrasos escalonados para filhos de [data-stagger] */
    $$('[data-stagger]', ctx).forEach(function (pai) {
      Array.prototype.forEach.call(pai.children, function (filho, i) {
        filho.classList.add('reveal');
        filho.style.setProperty('--delay', Math.min(i * 0.07, 0.5) + 's');
        if (els.indexOf(filho) === -1) els.push(filho);
      });
    });
    var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduz || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); observer.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------ Componentes */
  function cardMinisterio(m) {
    var logo = m.logo
      ? '<span class="min-logo" aria-hidden="true"><img src="' + esc(m.logo) + '" alt="" loading="lazy" onload="IPJCSite.ajustarLogo(this)"></span>'
      : '<span class="min-logo min-logo--texto" aria-hidden="true">' + esc(m.sigla) + '</span>';
    return '<a class="min-card" href="ministerio.html?m=' + encodeURIComponent(m.slug) + '">' +
      logo +
      '<h3>' + esc(m.nome) + '</h3>' +
      '<p>' + esc(m.resumo) + '</p>' +
      '<span class="tag ' + (COR_CATEGORIA[m.categoria] || '') + '">' + esc(nomeCategoria(m.categoria)) + '</span>' +
      icon('diagonal', ' class="seta"') +
    '</a>';
  }

  function cardEvento(e) {
    var d = parseData(e.data);
    return '<a class="evento-card" href="' + linkEvento(e) + '">' +
      '<span class="evento-data"><span class="dia">' + d.getDate() + '</span><span class="mes">' + MESES[d.getMonth()] + '</span></span>' +
      '<span>' +
        '<span class="tag ' + (COR_CATEGORIA[e.categoria] || '') + '">' + esc(nomeCategoria(e.categoria) || 'Geral') + '</span>' +
        '<h3>' + esc(e.titulo) + '</h3>' +
        '<span class="evento-meta">' +
          (e.horario ? '<span>' + icon('relogio') + esc(e.horario) + '</span>' : '') +
          (e.local ? '<span>' + icon('pin') + esc(e.local) + '</span>' : '') +
        '</span>' +
      '</span>' +
    '</a>';
  }

  /* Equaliza o tamanho visual de logos com proporções diferentes: mantém a
     área aproximadamente constante (logos largas ficam mais baixas, as altas,
     mais estreitas), dentro dos limites do espaço do card. */
  function ajustarLogo(img) {
    var r = img.naturalWidth / img.naturalHeight;
    if (!r) return;
    var area = 6200, altMax = 84, largMax = 170;
    var h = Math.min(altMax, Math.sqrt(area / r), largMax / r);
    img.style.height = Math.round(h) + 'px';
    img.style.width = 'auto';
  }

  /* Vídeo do YouTube que só carrega o player ao clicar */
  function videoLite(alvo, id, titulo) {
    if (!alvo || !id) return;
    alvo.innerHTML =
      '<button class="video-lite" type="button" style="background-image:url(https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg)" aria-label="Assistir ao vídeo: ' + esc(titulo) + '">' +
        '<span class="play"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span>' +
        '<span class="rotulo-video">' + esc(titulo) + '</span>' +
      '</button>';
    alvo.querySelector('button').addEventListener('click', function () {
      var player = document.createElement('div');
      player.className = 'video-lite';
      player.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0" title="' + esc(titulo) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      this.replaceWith(player);
      player.querySelector('iframe').focus();
    }, { once: true });
  }

  /* ------------------------------------------------------------ Home */
  function renderHome() {
    /* Cultos: "Cultos · dom · 9h e 18h30" com separadores em destaque */
    var titulo = $('#home-cultos-titulo');
    if (titulo) titulo.innerHTML = esc(D.cultos.resumo).split(' · ').join('<span class="sep">·</span>');

    var end = $('#home-endereco');
    if (end) {
      var e = D.igreja.endereco;
      end.innerHTML = '<a ' + attrsExterno(e.mapa) + '>' + esc(e.rua + ' — ' + e.bairro + ', ' + e.cidade + '/' + e.uf) + '</a>';
    }

    /* Agenda de domingo: "Hoje" aos domingos, com o item em andamento destacado */
    var lista = $('#ha-lista');
    if (lista && D.cultos.domingo) {
      var agora = new Date();
      var ehDomingo = agora.getDay() === 0;
      var min = agora.getHours() * 60 + agora.getMinutes();
      var fimDoDia = D.cultos.domingo.reduce(function (f, c) { return Math.max(f, c.h * 60 + c.m + c.dur); }, 0);
      var hoje = ehDomingo && min < fimDoDia;
      var prox = new Date(agora); prox.setDate(agora.getDate() + (hoje ? 0 : (7 - agora.getDay()) % 7 || 7));
      $('#ha-rotulo').textContent = hoje ? 'Hoje · domingo' : 'Este domingo · ' + prox.getDate() + ' de ' + MESES_LONGOS[prox.getMonth()];
      lista.innerHTML = D.cultos.domingo.map(function (c) {
        var ini = c.h * 60 + c.m;
        var estado = !hoje ? '' : (min >= ini && min < ini + c.dur ? 'agora' : (min >= ini + c.dur ? 'passou' : ''));
        var hora = c.h + 'h' + (c.m ? String(c.m).padStart(2, '0') : '');
        return '<li class="' + (estado ? 'is-' + estado : '') + '"><span class="ha-hora">' + hora + '</span><span class="ha-titulo">' + esc(c.titulo) + '</span>' +
          (estado === 'agora' ? (c.aoVivo ? '<a class="ha-agora" ' + attrsExterno(D.redes.youtube) + '>Ao vivo agora</a>' : '<span class="ha-agora">Acontecendo</span>') : '') + '</li>';
      }).join('');
    }
    /* Leitura do dia (plano de leitura) */
    if (window.IPJCPlano && $('#ha-leitura')) {
      var h = new Date(), n = h.getDate(), dm = [31,28,31,30,31,30,31,31,30,31,30,31];
      if (!(h.getMonth() === 1 && h.getDate() === 29)) {
        for (var mm = 0; mm < h.getMonth(); mm++) n += dm[mm];
        var lido = window.IPJCPlano.gerar()[n - 1];
        $('#ha-leitura-txt').textContent = lido.at + ' · ' + lido.nt;
        $('#ha-leitura').hidden = false;
      }
    }

    var mins = $('#home-ministerios');
    if (mins) mins.innerHTML = D.ministerios.filter(function (m) { return m.home; }).map(cardMinisterio).join('');

    var semana = $('#home-semana');
    if (semana) {
      semana.innerHTML = D.programacaoRegular.filter(function (p) { return !p.destaque; }).map(function (p) {
        return '<li>' +
          '<span class="quando">' + esc(p.quando) + '</span>' +
          '<h3>' + esc(p.titulo) + '</h3>' +
          '<p>' + (p.horario ? '<span class="hora">' + esc(p.horario) + '</span> · ' : '') + esc(p.local) + '</p>' +
        '</li>';
      }).join('');
    }

    var evs = $('#home-eventos');
    if (evs) {
      var proximos = eventosFuturos().slice(0, 3);
      evs.innerHTML = proximos.length
        ? proximos.map(cardEvento).join('')
        : '<p class="vazio">Novas programações especiais em breve. Acompanhe nossas redes!</p>';
    }

  }

  /* ------------------------------------------------------------ Init */
  var PAGINAS = { home: renderHome };

  function init() {
    renderHeader();
    renderFooter();
    bindDados(document);
    var pagina = document.body.getAttribute('data-page');
    if (PAGINAS[pagina]) PAGINAS[pagina]();
    initReveal(document);
  }

  /* API compartilhada para as demais páginas (e para o admin) */
  window.IPJCSite = {
    esc: esc, get: get, icon: icon, formatarTexto: formatarTexto, parseData: parseData, hoje: hoje, dataLonga: dataLonga,
    eventosFuturos: eventosFuturos, nomeCategoria: nomeCategoria, linkTel: linkTel, linkWhats: linkWhats,
    cardMinisterio: cardMinisterio, cardEvento: cardEvento, initReveal: initReveal,
    videoLite: videoLite, ajustarLogo: ajustarLogo,
    registrarPagina: function (nome, fn) { PAGINAS[nome] = fn; },
    periodoEvento: periodoEvento, enderecoEvento: enderecoEvento, linkEvento: linkEvento, baixarIcs: baixarIcs,
    chaveData: chaveData, DIAS_SEMANA: DIAS_SEMANA,
    MESES: MESES, MESES_LONGOS: MESES_LONGOS
  };

  /* Espera o DOMContentLoaded mesmo com readyState "interactive": scripts defer
     de cada página (ex.: quem-somos.js) rodam depois deste e registram seus renderizadores. */
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
