/* ==========================================================================
   IPJC v3 — Dados centralizados do site
   --------------------------------------------------------------------------
   Este objeto alimenta todas as páginas. O painel admin (admin.html) salva
   alterações das coleções editáveis (programações, boletins, blog) no
   localStorage, sob a chave IPJC_STORAGE_KEY; elas sobrescrevem os valores
   padrão abaixo ao carregar a página.

   ⚠️  Campos marcados com TODO precisam ser preenchidos com dados reais.
   ========================================================================== */

window.IPJC_STORAGE_KEY = 'ipjc-v3-dados';

window.IPJC = {

  /* ---------------------------------------------------------------- Igreja */
  igreja: {
    sigla: 'IPJC',
    nome: 'Igreja Presbiteriana em Jardim Camburi',
    nomeCompleto: 'Igreja Presbiteriana do Brasil – Jardim Camburi/ES',
    denominacao: 'Igreja Presbiteriana do Brasil (IPB)',
    cnpj: '02.342.872/0001-63',
    fundacao: '1997-12-14',
    pastor: 'Pr. Ronildo',
    slogan: 'Com Jesus, o jardim é mais bonito',
    endereco: {
      rua: 'Rua Carlos Delgado Guerra Pinto, nº 761',
      bairro: 'Jardim Camburi',
      cidade: 'Vitória',
      uf: 'ES',
      mapa: 'https://www.google.com/maps/search/?api=1&query=Rua+Carlos+Delgado+Guerra+Pinto+761+Jardim+Camburi+Vitoria+ES'
    }
  },

  /* -------------------------------------------------------------- Contatos */
  contato: {
    telefone: '',                        // a igreja não tem telefone fixo
    whatsapp: '(27) 98128-3997',
    email: 'ipjc@hotmail.com',           // recebe os formulários do site
    emailOracao: 'ipjc@hotmail.com',    // pedidos de oração (pode ser outro e-mail, ex.: do pastor)
    /* Os formulários do site são enviados pelo FormSubmit (formsubmit.co), gratuito.
       No 1º envio para cada e-mail, o FormSubmit manda uma mensagem de ativação:
       é preciso clicar em "Activate" uma única vez. */
    formulariosAtivos: true,
    site: 'ipjc.org.br'
  },

  redes: {
    instagram: 'https://www.instagram.com/ipbjardimcamburi/',
    facebook: 'https://www.facebook.com/ipjc.vix',
    youtube: 'https://www.youtube.com/@ipbjardimcamburi',   // usado também no botão "Ao Vivo"
    spotify: 'https://open.spotify.com/show/1FKtu2z3D4wswzajEqSoQm',                 // podcast
    spotifyPlaylists: 'https://open.spotify.com/user/y2sv53v2za9cbb4i47r72ddi3'     // playlists da igreja
  },

  /* Botão "Quero ser membro": a página membro.html redireciona para este link
     (ex.: o formulário que já existe no site atual). Em branco, mostra orientações. */
  membresia: {
    url: 'https://mobile.fielweb.com.br/cadastro/formulario.php'   // formulário de interesse (FielWeb)
  },

  podcast: {
    titulo: 'Podcast IPJC',
    descricao: 'Sermões e reflexões bíblicas para ouvir onde estiver — no carro, na caminhada pelo calçadão ou em casa.'
  },

  videos: {
    institucionalIPJC: '-sDEolxMh68',
    institucionalONG: 'LOt1l717DtE'
  },

  /* ------------------------------------------------------- Versículos/tema */
  versiculos: {
    ancora: {
      texto: 'Passará o céu e a terra, porém as minhas palavras não passarão.',
      ref: 'Lucas 21.33'
    },
    tema: {
      texto: 'Cantai ao Senhor, bendizei o seu nome; proclamai a sua salvação, dia após dia.',
      ref: 'Salmos 96.2',
      periodo: '2027–2028'
    }
  },

  campanha30: {
    titulo: 'Dia Após Dia',
    subtitulo: 'IPJC 30 Anos',
    lancamento: '2026-12-06',
    celebracao: '2027-12-06'
  },

  /* ------------------------------------------------------------ Cultos */
  cultos: {
    resumo: 'Cultos · dom · 9h e 18h30',
    /* agenda de domingo exibida na home (hora, minuto, duração em minutos) */
    domingo: [
      { titulo: 'Culto', h: 9, m: 0, dur: 90, aoVivo: true },
      { titulo: 'EBD — Escola Bíblica Discipuladora', h: 10, m: 50, dur: 60 },
      { titulo: 'Culto', h: 18, m: 30, dur: 90, aoVivo: true }
    ],
    ebd: 'EBD · dom · 10h50',
    dia: 'Domingo',
    horarios: ['9h', '18h30']
  },

  /* Programação regular semanal */
  programacaoRegular: [
    { titulo: 'Cultos', quando: 'Domingos', horario: '9h e 18h30', local: 'Templo', descricao: 'Culto público com Ministério Infantil nos dois horários.', destaque: true },
    { titulo: 'EBD — Escola Bíblica Discipuladora', quando: 'Domingos', horario: '10h50', local: 'Classes em diferentes locais', descricao: 'Classes por faixa etária, de bebês a adultos.' },
    { titulo: 'Culto de Oração', quando: 'Terças · quinzenal', horario: '19h30', local: 'Templo', descricao: 'Intercalado com o Jesus na Rua.' },
    { titulo: 'Jesus na Rua', quando: 'Terças · quinzenal', horario: '19h30', local: 'Praça da Bocha, Jardim Camburi', descricao: 'Evangelismo ao ar livre.' },
    { titulo: 'Ensaio do Coral Jardim', quando: 'Quartas', horario: '19h30', local: 'Templo', descricao: 'Aberto a quem deseja servir com a voz.' }
  ],

  /* ------------------------------------------------------- Categorias */
  categorias: [
    { id: 'geral', nome: 'Geral' },
    { id: 'sociedades', nome: 'Sociedades Internas' },
    { id: 'ministerios', nome: 'Ministérios' },
    { id: 'adoracao', nome: 'Adoração' },
    { id: 'ensino', nome: 'Ensino' },
    { id: 'missoes', nome: 'Missões' }
  ],

  /* ------------------------------------------------------- Ministérios
     categoria → id de `categorias`. Cada ministério tem página individual
     em ministerio.html?m=<slug>. Fotos em assets/img/ministerios/. */
  ministerios: [
    { slug: 'ump', home: true, quando: 'Encontros mensais', publico: 'Jovens de 18 a 35 anos', sigla: 'UMP', nome: 'União da Mocidade Presbiteriana', categoria: 'sociedades',
      resumo: 'Jovens crescendo juntos na fé, na amizade e no serviço.',
      descricao: 'A UMP é a sociedade interna que reúne os jovens da igreja. Na IPJC, a mocidade **se encontra mensalmente** para estudar a Palavra, orar, conviver e servir, formando uma geração comprometida com Cristo e com a sua igreja.\n\nMais do que um grupo de amigos, a UMP é **lugar de discipulado**: jovens que aprendem a viver a fé no estudo, no trabalho, na família e na cidade.',
      historia: 'A primeira União de Mocidade Presbiteriana foi organizada na Igreja Presbiteriana do Rio de Janeiro, em 28 de agosto de 1934. Em 1936, o Supremo Concílio recomendou que as igrejas locais criassem suas UMPs, e em 1946 foi organizada a Confederação Nacional da mocidade. Hoje a UMP está presente em igrejas de todo o Brasil.',
      lema: { texto: 'Alegres na esperança, fortes na fé, dedicados no amor, unidos no trabalho.', ref: 'Moto da UMP' },
      logo: 'assets/img/ministerios/ump-mono.png', logoCor: 'assets/img/ministerios/ump.png' },
    { slug: 'upa', home: true, publico: 'Adolescentes de 12 a 18 anos', sigla: 'UPA', nome: 'União Presbiteriana de Adolescentes', categoria: 'sociedades',
      resumo: 'Adolescentes descobrindo a fé com profundidade e alegria.',
      descricao: 'A UPA é a sociedade interna dos adolescentes, **dos 12 aos 18 anos**. É o espaço para aprender, perguntar, conviver e servir, **sempre a partir das Escrituras**, numa fase da vida cheia de descobertas e decisões.',
      lema: { texto: 'Ao Mestre, sejamos fiéis; nas trevas, sejamos luz; nas lutas, sejamos fortes, servindo ao Senhor Jesus.', ref: 'Moto da UPA' },
      historia: 'A União Presbiteriana de Adolescentes nasceu em 9 de julho de 1967, na Igreja Presbiteriana do Rio de Janeiro, a partir do trabalho de Dorcas Araújo Machado. Ela percebeu que muitos adolescentes chegavam cedo aos cultos sem ter uma atividade própria e pediu ao Conselho um espaço para eles. Dali surgiram estudos bíblicos, evangelismo, teatro e música, e o trabalho se espalhou pelo país. O Dia do Adolescente Presbiteriano é celebrado no 4º domingo de julho.',
      logo: 'assets/img/ministerios/upa-mono.png', logoCor: 'assets/img/ministerios/upa.png' },
    { slug: 'ucp', publico: 'Crianças de 6 a 11 anos', sigla: 'UCP', nome: 'União de Crianças Presbiterianas', categoria: 'sociedades',
      resumo: 'Crianças aprendendo a amar a Deus desde cedo.',
      descricao: 'A UCP é a sociedade interna das crianças, **dos 6 aos 11 anos**. Com ensino bíblico, convivência, louvor e muita alegria, ajuda as crianças a **conhecer a Cristo**, viver a fé no dia a dia e dar os primeiros passos no serviço à igreja.',
      historia: 'Na Igreja Presbiteriana do Brasil, a UCP é acompanhada pela Secretaria Nacional do Trabalho da Infância, que orienta as igrejas no cuidado com as crianças: anunciar o evangelho, edificar vidas, incentivar práticas cristãs e formar servos para a obra de Deus.',
      lema: { texto: 'Batalhando por Cristo, lutando com amor, sou um soldado de nosso Senhor.', ref: 'Moto da UCP' },
      logo: 'assets/img/ministerios/ucp-mono.png', logoCor: 'assets/img/ministerios/ucp.png' },
    { slug: 'infantil', home: true, quando: 'Domingos: cultos às 9h e às 18h30 e EBD às 10h50', publico: 'Crianças de 6 meses a 11 anos e 11 meses', sigla: 'MI', nome: 'Ministério Infantil', categoria: 'ministerios',
      resumo: 'Crianças conhecendo e amando a Deus, todos os domingos.',
      descricao: 'Na IPJC, as crianças não são só o futuro da igreja: **elas já fazem parte dela**. Por isso, todos os domingos há um trabalho pensado para elas, com o mesmo cuidado que dedicamos a todo o rebanho.\n\nAlém dos domingos, o Ministério Infantil tem outras frentes: **a UCP**, sociedade interna das crianças, e **o Coral Jardim Kids**, que ensina os pequenos a louvar a Deus cantando juntos.',
      blocos: [
        { titulo: 'O trabalho com as crianças na IPB', texto: 'A Igreja Presbiteriana do Brasil entende que ensinar as crianças é responsabilidade de toda a igreja, e não só da família. A Secretaria Nacional do Trabalho da Infância orienta as igrejas locais nesse cuidado, e a Editora Cultura Cristã, da própria IPB, publica material de Escola Dominical para cada faixa etária, firmado na fé reformada.\n\nO alvo é o mesmo em todo o país: anunciar o evangelho às crianças, ensinar as Escrituras com fidelidade, ajudá-las a viver a fé no dia a dia e prepará-las para servir ao Senhor. Os filhos dos crentes fazem parte da aliança e devem ser criados “na disciplina e na admoestação do Senhor” (Efésios 6.4). O Ministério Infantil caminha ao lado dos pais nessa tarefa.' }
      ],
      versiculo: { texto: 'Deixai vir a mim os pequeninos, não os embaraceis, porque dos tais é o reino de Deus.', ref: 'Marcos 10.14' },
      logo: 'assets/img/ministerios/infantil-mono.png', logoCor: 'assets/img/ministerios/infantil.png',
      secoes: [
        { titulo: 'Culto Infantil', logo: 'assets/img/ministerios/culto-infantil.png', quando: 'Domingos, às 9h e às 18h30',
          texto: 'Nos dois horários de culto, às 9h e às 18h30, acontece o Culto Infantil. As crianças ouvem **a mesma mensagem pregada no culto principal, só que na linguagem delas**, com histórias, perguntas, cânticos e oração.\n\nAssim, ao voltar para casa, **pais e filhos podem conversar sobre o mesmo texto bíblico**.' },
        { titulo: 'EBD Kids', logo: 'assets/img/ministerios/ebd-kids.png', quando: 'Domingos, às 10h50',
          texto: 'Às 10h50, na Escola Bíblica Discipuladora, as crianças de **6 meses a 11 anos e 11 meses** estudam a Palavra de Deus em classes por faixa etária.\n\n**Cada idade tem material próprio de estudo**, para que o ensino acompanhe o desenvolvimento de cada criança, do berçário à pré-adolescência.' }
      ],
      subcardsTitulo: 'Outras frentes do ministério',
      subcards: [
        { titulo: 'UCP', logo: 'assets/img/ministerios/ucp.png', href: 'ministerio.html?m=ucp', texto: 'A União de Crianças Presbiterianas, sociedade interna das crianças de 6 a 11 anos.' },
        { titulo: 'Coral Jardim Kids', logo: 'assets/img/ministerios/coral-jardim-kids.png', href: 'ministerio.html?m=coral-jardim-kids', texto: 'O coro das crianças, aberto a todas que quiserem cantar.' }
      ] },
    { slug: 'mulheres', home: true, publico: 'Mulheres', sigla: 'MM', nome: 'Ministério de Mulheres', categoria: 'ministerios',
      resumo: 'Mulheres firmadas na Palavra, servindo umas às outras.',
      descricao: 'O Ministério de Mulheres reúne as mulheres da igreja, **de todas as idades**, para **estudo da Palavra, oração, comunhão e serviço**, cuidando umas das outras e abençoando a igreja e a cidade.',
      historia: 'O trabalho com as mulheres é um dos mais antigos da Igreja Presbiteriana do Brasil. Em 11 de novembro de 1884, em Recife, foi organizada a Associação Evangélica de Senhoras, que reunia as irmãs para estudar a Bíblia e ajudar os necessitados e a igreja. Em 1941, o trabalho passou a se chamar Sociedade Auxiliadora Feminina, a SAF, nome pelo qual é conhecido em igrejas de todo o país. Em muitas igrejas presbiterianas, é a SAF que reúne as mulheres; na IPJC, esse trabalho acontece no Ministério de Mulheres.',
      lema: { texto: 'Sê tu uma bênção.', ref: 'Lema da SAF · Gênesis 12.2' },
      logo: 'assets/img/ministerios/mulheres-mono.png', logoCor: 'assets/img/ministerios/mulheres.png' },
    { slug: 'homens', home: true, publico: 'Homens', sigla: 'MH', nome: 'Ministério de Homens', categoria: 'ministerios',
      resumo: 'Homens que lideram servindo, em casa e na igreja.',
      descricao: 'O Ministério de Homens reúne os homens da igreja para **crescer na fé, no caráter e na responsabilidade de servir**: em casa, no trabalho, na igreja e na cidade.',
      historia: 'Na Igreja Presbiteriana do Brasil, o trabalho com os homens é organizado na UPH, a União Presbiteriana de Homens. Antes de 1900 já havia homens organizados em igrejas locais; em 1951 foi eleito o primeiro secretário geral do trabalho masculino da IPB e, em 1966, aconteceu em Campinas o I Congresso Nacional dos Homens Presbiterianos. Na IPJC, esse trabalho acontece no Ministério de Homens.',
      lema: { texto: 'Vinde após mim, e eu vos farei pescadores de homens.', ref: 'Lema da UPH · Mateus 4.19' },
      logo: 'assets/img/ministerios/homens-mono.png', logoCor: 'assets/img/ministerios/homens.png' },
    { slug: 'casais', publico: 'Casais casados, noivos e namorados', sigla: 'MC', nome: 'Ministério de Casais', categoria: 'ministerios',
      resumo: 'Relacionamentos edificados sobre a rocha, do namoro ao casamento.',
      descricao: 'O Ministério de Casais existe na IPJC **desde 2025** e é voltado para **casais casados, noivos e namorados**. Nasceu do desejo de cuidar dos relacionamentos à luz das Escrituras, em todas as fases: do namoro que busca honrar a Deus ao casamento que já atravessou muitos anos.\n\nO casamento foi criado por Deus e aponta para algo maior do que ele mesmo: **o amor de Cristo pela sua igreja** (Efésios 5.25-32). Por isso, mais do que dicas para conviver melhor, queremos olhar juntos para a Palavra, que ensina sobre aliança, perdão, serviço mútuo, comunicação, finanças, sexualidade e criação de filhos.\n\nOs encontros combinam ensino bíblico, conversa e comunhão. É um espaço para aprender com outros casais, ser encorajado e ajudar quem está começando. **Ninguém precisa ter um relacionamento perfeito para participar**: todos nós dependemos da graça de Deus.',
      versiculo: { texto: 'Se alguém quiser prevalecer contra um, os dois lhe resistirão; o cordão de três dobras não se rebenta com facilidade.', ref: 'Eclesiastes 4.12' },
      logo: 'assets/img/ministerios/casais-mono.png', logoCor: 'assets/img/ministerios/casais.png' },
    { slug: 'louvor', home: true, quando: 'Todos os fins de semana, nos cultos e nas agendas oficiais da igreja', publico: 'Músicos e cantores voluntários', sigla: 'ML', nome: 'Ministério de Louvor', categoria: 'adoracao',
      resumo: 'Conduzindo a igreja a cantar ao Senhor, todos os fins de semana.',
      descricao: 'Fomos criados para adorar. O Breve Catecismo de Westminster começa lembrando que “**o fim principal do homem é glorificar a Deus e gozá-lo para sempre**”. A adoração não é um momento do culto reservado à música: **é a resposta de toda a vida** a quem Deus é e ao que ele fez por nós em Cristo.\n\nNo culto público, essa resposta ganha voz. Cantamos porque Deus nos chama a cantar e porque o evangelho nos dá motivo para isso. Os cânticos ensinam, consolam, exortam e unem a igreja numa só voz, enquanto a Palavra de Cristo habita ricamente em nós. Por isso, **o que cantamos importa**: as letras precisam ser fiéis às Escrituras, e a música deve servir à congregação, e não ocupar o seu lugar.\n\nO Ministério de Louvor da IPJC atua **todos os fins de semana**, nos cultos e nas agendas oficiais da igreja. É formado por **irmãos voluntários e dispostos**, que dedicam tempo, ensaio e talento para conduzir a congregação no canto. O alvo não é apresentação nem desempenho, mas **ajudar a igreja inteira a cantar ao Senhor** com entendimento e alegria.',
      blocos: [
        { titulo: 'Quer servir no louvor?', texto: 'Se você canta ou toca um instrumento e deseja servir, fale com a secretaria pelo WhatsApp. O Ministério de Louvor também tem dois braços corais, o Coral Jardim e o Coral Jardim Kids, abertos a quem quiser participar.' }
      ],
      versiculo: { texto: 'Habite, ricamente, em vós a palavra de Cristo; instruí-vos e aconselhai-vos mutuamente em toda a sabedoria, louvando a Deus, com salmos, e hinos, e cânticos espirituais, com gratidão, em vosso coração.', ref: 'Colossenses 3.16' },
      logo: 'assets/img/ministerios/louvor-mono.png', logoCor: 'assets/img/ministerios/louvor.png',
      subcards: [
        { titulo: 'Coral Jardim', logo: 'assets/img/ministerios/coral-jardim.png', href: 'ministerio.html?m=coral-jardim', texto: 'O coro da igreja. Ensaios às quartas, às 19h30, no templo.' },
        { titulo: 'Coral Jardim Kids', logo: 'assets/img/ministerios/coral-jardim-kids.png', href: 'ministerio.html?m=coral-jardim-kids', texto: 'O coro das crianças, com ensaios conforme agenda própria.' }
      ] },
    { slug: 'coral-jardim', quando: 'Ensaios às quartas, 19h30', local: 'Templo da IPJC', publico: 'Aberto a todos que quiserem cantar', sigla: 'CJ', nome: 'Coral Jardim', categoria: 'adoracao',
      resumo: 'Vozes unidas para louvar a Deus. Ensaios às quartas, às 19h30.',
      descricao: 'O Coral Jardim é um **braço do Ministério de Louvor** da IPJC. Reúne irmãos de diferentes idades que desejam servir a Deus com a voz e ajudar a igreja a celebrar as grandes verdades da fé por meio da música coral.\n\nOs ensaios acontecem toda semana, **às quartas-feiras, às 19h30**, no templo. Neles, o coro trabalha técnica vocal, afinação e repertório, mas também ora, convive e aprende o sentido do que canta. As apresentações são pontuais, geralmente **na Páscoa, no Natal e em datas comemorativas** da igreja.\n\n**Há 10 anos**, o Coral Jardim participa também da junção de coros com outras igrejas presbiterianas da Grande Vitória, um encontro que mostra, em forma de música, a unidade da igreja de Cristo.\n\nO coral é **aberto a todos que quiserem participar, inclusive a quem acha que não sabe cantar**. Não é preciso experiência nem saber ler partitura: a voz se desenvolve nos ensaios, e o mais importante é a disposição para servir.',
      versiculo: { texto: 'Cantai ao SENHOR um cântico novo, cantai ao SENHOR, todas as terras.', ref: 'Salmo 96.1' },
      logo: 'assets/img/ministerios/coral-jardim-mono.png', logoCor: 'assets/img/ministerios/coral-jardim.png' },
    { slug: 'coral-jardim-kids', quando: 'Ensaios conforme agenda própria', publico: 'Aberto a todas as crianças', sigla: 'CJK', nome: 'Coral Jardim Kids', categoria: 'adoracao',
      resumo: 'As crianças cantando as maravilhas de Deus.',
      descricao: 'O Coral Jardim Kids é o **braço do Ministério de Louvor com as crianças**. Nele, os pequenos aprendem a louvar a Deus cantando juntos e guardam no coração, por meio da música, verdades da Palavra que vão levar para a vida toda.\n\nOs ensaios seguem uma agenda própria, combinada com as famílias, e as apresentações são pontuais, em ocasiões especiais da igreja. Cada ensaio é também um momento de ensino, convivência e muita alegria.\n\nO coral é **aberto a todas as crianças**. Não é preciso saber cantar nem ter experiência: basta ter vontade de participar. Pais e responsáveis podem falar com a secretaria pelo WhatsApp para saber as próximas datas.',
      versiculo: { texto: 'Da boca de pequeninos e crianças de peito tiraste perfeito louvor.', ref: 'Mateus 21.16' },
      logo: 'assets/img/ministerios/coral-jardim-kids-mono.png', logoCor: 'assets/img/ministerios/coral-jardim-kids.png' },
    { slug: 'ebd', quando: 'Domingos, às 10h50', publico: 'Todas as idades, com classes por faixa etária', local: 'Classes em diferentes locais', sigla: 'EBD', nome: 'Escola Bíblica Discipuladora', categoria: 'ensino',
      resumo: 'O braço de ensino da IPJC. Domingos, às 10h50, para todas as idades.',
      descricao: 'Na IPJC, a Escola Bíblica Discipuladora é o **nosso braço de ensino**. **Todos os domingos, às 10h50**, a igreja se divide em classes por faixa etária e por perfil, em diferentes locais, para estudar a Bíblia de forma organizada, com espaço para perguntas e conversa.\n\nA EBD segue um **currículo próprio, preparado a cada ano**, que percorre livros da Bíblia, doutrinas e temas da vida cristã. Em alguns domingos, todas as classes se reúnem no templo para uma aula única, e algumas datas são reservadas para a EBD fora do templo.\n\nÉ também na EBD que acontece a **classe de Fundamentos**, para os catecúmenos: quem deseja fazer a pública profissão de fé, ser batizado ou tornar-se membro da igreja estuda ali as bases da fé cristã e da Igreja Presbiteriana.',
      blocos: [
        { titulo: 'Por que o ensino importa', texto: 'Jesus enviou a igreja a fazer discípulos, “ensinando-os a guardar todas as coisas” que ele ordenou (Mateus 28.20). **Ensinar não é um acessório da vida da igreja: é parte da sua missão.** A fé cristã tem conteúdo, e conhecer a Deus pela sua Palavra transforma a maneira como pensamos, adoramos, trabalhamos e nos relacionamos.\n\nNa tradição reformada, o estudo das Escrituras sempre foi **para todo o povo de Deus**, e não só para pastores e líderes. Por isso a EBD tem classes do berçário à terceira idade: crianças aprendendo as histórias da Bíblia, adolescentes e jovens firmando suas convicções, adultos aprofundando-se nas Escrituras e todos crescendo juntos “na graça e no conhecimento de nosso Senhor e Salvador Jesus Cristo” (2 Pedro 3.18).' }
      ],
      versiculo: { texto: 'Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça, a fim de que o homem de Deus seja perfeito e perfeitamente habilitado para toda boa obra.', ref: '2 Timóteo 3.16-17' },
      logo: 'assets/img/ministerios/ebd-mono.png', logoCor: 'assets/img/ministerios/ebd.png',
      /* Classes da EBD (atualizar a cada ano) */
      classes: [
        { nome: 'Crianças (EBD Kids)', publico: 'De 6 meses a 11 anos e 11 meses', descricao: 'Classes por faixa etária, com material próprio para cada idade.', link: 'ministerio.html?m=infantil' },
        { nome: 'Adolescentes', publico: '12 a 14 anos', local: 'Escola Maria Madalena', professores: 'Débora Fonseca, Mayara, Weder, Milena, Allan Ribeiro, Iorrany e Elaine' },
        { nome: 'Adolescentes', publico: '15 a 17 anos', local: 'Escola Maria Madalena', professores: 'Débora Fonseca, Weder, Milena, Allan Ribeiro, Iorrany, Júlia Ribeiro e Aline' },
        { nome: 'Jovens', local: 'Escola Maria Madalena', professores: 'Pb. Marcus Nati, Irislane, Victoria Louzada, João Roella, Stephanye Oliveira e Simone Tosi' },
        { nome: 'Terceira idade', local: 'Templo da IPJC', professores: 'Pr. Joaz, Allan Ribeiro, Alan Guimarães, Stephanye Oliveira, Pb. Raphael Cezar e Pb. Olívio' },
        { nome: 'Mista', local: 'Casa da IPJC', professores: 'Hudson, Ronan, Eliézer, Adriana Carvalho, Roney Tosi, Wanderley e Tâmara' },
        { nome: 'Mista', local: 'Antiga biblioteca, segundo andar', professores: 'Pr. André, Daniel, Suzana, Adson, Kevin Saleme e Wesley Robertson' },
        { nome: 'Fundamentos', publico: 'Catecúmenos e quem deseja ser membro', local: 'Casa da IPJC', professores: 'Pr. Ronildo, Alencar e membros do Conselho', link: 'membro.html' }
      ],
      /* Currículo anual: datas AAAA-MM-DD; obs opcional */
      curriculo: { ano: 2026, modulos: [
        { titulo: 'Liderando segundo a vontade de Deus', nota: 'Classe única', aulas: [
          ['2026-01-04', 'A liderança e o caráter cristão'], ['2026-01-11', 'A liderança e a igreja'],
          ['2026-01-18', 'A liderança do presbítero'], ['2026-01-25', 'A liderança do diácono'] ] },
        { titulo: 'Examinai as Escrituras', subtitulo: 'Cartas e Apocalipse', aulas: [
          ['2026-02-01', 'Romanos'], ['2026-02-08', '1 e 2 Coríntios'], ['2026-02-15', 'Gálatas', 'Classe única no templo'],
          ['2026-02-22', 'Efésios'], ['2026-03-01', 'Filipenses'], ['2026-03-08', 'Colossenses'],
          ['2026-03-15', '1 e 2 Tessalonicenses'], ['2026-03-22', '1 e 2 Timóteo e Tito'], ['2026-03-29', 'Filemom'],
          ['2026-04-05', 'Hebreus', 'Classe única no templo'], ['2026-04-12', 'Tiago'], ['2026-04-19', '1 e 2 Pedro'],
          ['2026-04-26', '1, 2 e 3 João'], ['2026-05-03', 'Judas', 'Classe única no templo'], ['2026-05-10', 'Apocalipse'],
          ['2026-05-17', 'EBD fora do templo'] ] },
        { titulo: 'Teologia pública', subtitulo: 'Aplicando a Palavra de Deus à cultura e à sociedade', aulas: [
          ['2026-05-24', 'Cultura'], ['2026-05-31', 'Educação'], ['2026-06-07', 'Artes'], ['2026-06-14', 'Trabalho'],
          ['2026-06-21', 'Dinheiro'], ['2026-06-28', 'Justiça social e desigualdade social'], ['2026-07-05', 'Justiça'],
          ['2026-07-12', 'Respeito à vida'], ['2026-07-19', 'O estrangeiro'], ['2026-07-26', 'Liberdade'],
          ['2026-08-02', 'Política'], ['2026-08-09', 'EBD fora do templo'] ] },
        { titulo: 'Evangelização na igreja primitiva', subtitulo: 'Baseado no livro de Michael Green', aulas: [
          ['2026-08-16', 'Vias para a evangelização'], ['2026-08-23', 'Os obstáculos à evangelização'], ['2026-08-30', 'O evangelho'],
          ['2026-09-06', 'A evangelização dos judeus', 'Classe única no templo'], ['2026-09-13', 'A evangelização dos gentios'],
          ['2026-09-20', 'A conversão'], ['2026-09-27', 'Os evangelistas'], ['2026-10-04', 'A motivação evangelística'],
          ['2026-10-11', 'Os métodos evangelísticos'], ['2026-10-18', 'A estratégia evangelística'], ['2026-10-25', 'EBD fora do templo'],
          ['2026-11-01', 'Tema avulso: Retiro da IPJC', 'Classe única no templo'] ] },
        { titulo: 'Como estudar, entender e ensinar as Escrituras', subtitulo: 'Princípios de interpretação, ensino e pregação da Bíblia', aulas: [
          ['2026-11-08', 'Por que e como ler a Bíblia? Fundamentos teológicos do estudo bíblico'],
          ['2026-11-15', 'Como a Bíblia funciona? Panorama bíblico e unidade das Escrituras'],
          ['2026-11-22', 'Como interpretar a Bíblia? Princípios básicos de hermenêutica', 'Classe única no templo'],
          ['2026-11-29', 'Como estudar a Bíblia passo a passo? Método de estudo bíblico'],
          ['2026-12-06', 'Como ensinar a Bíblia? Princípios de ensino bíblico fiel'],
          ['2026-12-13', 'Como pregar a Bíblia? Fundamentos da pregação expositiva'],
          ['2026-12-20', 'Do texto à vida: aplicação, piedade e responsabilidade no ensino'],
          ['2026-12-27', 'EBD fora do templo'] ] }
      ] } },
    { slug: 'conselho-missionario', sigla: 'CM', nome: 'Conselho Missionário', categoria: 'missoes',
      resumo: 'Levando o evangelho daqui até os confins da terra.',
      descricao: 'A missão da igreja nasce do coração de Deus. Antes de subir aos céus, Jesus enviou seus discípulos a fazer discípulos de todas as nações (Mateus 28.19) e a ser suas testemunhas “tanto em Jerusalém como em toda a Judeia e Samaria e até aos confins da terra” (Atos 1.8). **Missões não é um departamento da igreja: é a própria igreja obedecendo ao seu Senhor.**\n\nO Conselho Missionário da IPJC existe para manter essa chama acesa. Ele **promove, acompanha e sustenta** a obra missionária da igreja: ora pelos missionários, informa a igreja sobre os campos, organiza o investimento em missões e cuida de quem foi enviado.',
      blocos: [
        { titulo: 'Missões nacionais e transculturais', texto: 'Chamamos de **missões nacionais** o trabalho de anunciar o evangelho e plantar igrejas dentro do Brasil, especialmente em cidades e regiões onde ainda há poucas igrejas fiéis às Escrituras. O missionário fala a mesma língua e compartilha a mesma cultura das pessoas que alcança.\n\n**Missões transculturais** é atravessar barreiras de língua e de cultura para anunciar Cristo a outro povo, muitas vezes em outro país e entre povos que quase não ouviram o evangelho. Exige aprender um novo idioma, entender outra cultura e, muitas vezes, viver longe da família e da igreja de origem por muitos anos. As duas frentes são necessárias, e as duas dependem de uma igreja que envia, sustenta e ora.' },
        { titulo: 'A IPB e a APMT', texto: 'A Igreja Presbiteriana do Brasil realiza sua obra missionária por meio de suas agências. A **Junta de Missões Nacionais (JMN)** cuida da plantação de igrejas pelo país, e a **Agência Presbiteriana de Missões Transculturais (APMT)** envia e acompanha missionários presbiterianos em outros povos e culturas, cuidando da sua preparação, do seu sustento e do cuidado pastoral no campo. Por meio delas, cada igreja local participa de uma obra muito maior do que conseguiria realizar sozinha.' },
        { titulo: 'Missões na IPJC', texto: 'A IPJC apoia missionários no Brasil e no exterior e, pela graça de Deus, **já enviou irmãos da nossa própria igreja para o campo transcultural**. Acompanhamos esses missionários com oração, sustento financeiro e cuidado, e procuramos manter a igreja perto deles.' }
      ],
      acoes: { titulo: 'Como você pode participar', intro: 'Todo cristão tem um lugar na obra missionária. Nem todos vão, mas todos podem fazer parte.', itens: [
        { icone: 'chama', titulo: 'Ore', texto: 'Pelos missionários, por suas famílias e pelos povos que ainda não ouviram o evangelho. A oração sustenta quem está no campo.' },
        { icone: 'doar', titulo: 'Contribua', texto: 'Com ofertas para a obra missionária. Cada contribuição ajuda a manter missionários no Brasil e no exterior.', link: 'contribua.html', linkTexto: 'Formas de contribuir' },
        { icone: 'globo', titulo: 'Participe', texto: 'Das programações de missões da igreja e conheça de perto os campos e os missionários que apoiamos.', link: 'programacoes.html', linkTexto: 'Ver programações' },
        { icone: 'enviar', titulo: 'Vá', texto: 'Se Deus despertar em você o desejo de ir, converse com o pastor e com o Conselho Missionário. O caminho até o campo começa na igreja local.' }
      ] },
      versiculo: { texto: 'E como pregarão, se não forem enviados? Como está escrito: Quão formosos são os pés dos que anunciam coisas boas!', ref: 'Romanos 10.15' },
      logo: 'assets/img/ministerios/conselho-missionario-mono.png', logoCor: 'assets/img/ministerios/conselho-missionario.png' }
  ],

  /* ------------------------------------------------------- Programações especiais
     Editáveis no admin. Datas no formato AAAA-MM-DD. Eventos cuja data
     (ou dataFim) já passou são ocultados automaticamente.
     categoria: geral | sociedades | ministerios | adoracao | ensino | missoes
     ministerio (opcional): slug do ministério/sociedade.
     local: nome do lugar (ex.: "Templo da IPJC", "Praça da Bocha").
     endereco (opcional): endereço completo para o mapa. Em branco, usa o endereço da
       igreja quando o local é o templo; senão, busca o próprio nome do local no mapa.
     whatsapp (opcional): em branco usa o WhatsApp oficial da igreja.
     arte (opcional): imagem 1080×1080 px. */
  programacoes: [],   // conteúdo em js/conteudo.js (gerado pelo admin)


  /* ------------------------------------------------------- Boletins (mensais)
     Editáveis no admin.
     id, mes ('AAAA-MM'), titulo (opcional — padrão "Boletim de <mês>"), resumo (opcional),
     arquivo: link do Google Drive (compartilhado como "qualquer pessoa com o link")
              ou caminho de um PDF hospedado no site (ex.: assets/boletins/2026-10.pdf),
     capa (opcional): imagem da 1ª página, 600×800 px. Sem capa, o site usa a miniatura
              da 1ª página do Drive / do PDF; se não houver, gera uma capa na identidade. */
  boletins: [],       // conteúdo em js/conteudo.js (gerado pelo admin)

  /* ------------------------------------------------------- Blog
     Editáveis no admin. Cada post tem página própria: post.html?p=<id>
     id (curto, sem espaços — vira o endereço), titulo, subtitulo, autor, data (AAAA-MM-DD),
     tag (ex.: Devocional, Estudo, Família), resumo, imagem (opcional, 1600×900 px),
     texto — parágrafos separados por linha em branco. Formatação simples aceita:
       ## Subtítulo      > citação      **negrito**      *itálico*      [texto](https://link) */
  /* Categorias do blog (o painel mostra esta lista para escolher) */
  blogCategorias: ['Devocional', 'Estudo bíblico', 'Vida cristã', 'Família', 'Missões', 'Notícias da igreja'],

  blog: [],           // conteúdo em js/conteudo.js (gerado pelo admin)

  /* ------------------------------------------------------- Congregações
     Cada uma tem página própria: congregacao.html?c=<slug>
     foto: imagem horizontal, 1600×1000 px (em branco mostra um espaço reservado com a logo).
     programas: [{ tipo: 'Culto', descricao: 'Domingos, 18h' }] — o tipo aparece em negrito.
     Opcionais: lema, versiculo { texto, ref } (ARA), email, site, marcos [{ quando, texto }],
     galeria [{ src, legenda }] (fotos sem metadados de localização). */
  congregacoes: [
    { slug: 'chacara-parreiral', nome: 'Congregação Presbiteriana em Chácara Parreiral', cidade: 'Serra/ES',
      resumo: 'Congregação da IPJC em Guaraciaba, na Serra, que nasceu de um pequeno grupo em 2015.',
      lema: 'Uma família enraizada em Cristo.',
      versiculo: { texto: 'Eu sou a videira, vós, os ramos. Quem permanece em mim, e eu, nele, esse dá muito fruto; porque sem mim nada podeis fazer.', ref: 'João 15.5' },
      historia: 'A IPJC é a igreja-sede da congregação e caminha ao seu lado desde 2016, apoiando seu crescimento até que se organize como igreja.',
      marcos: [
        { quando: '22/02/2015', texto: 'Começa um pequeno grupo no apartamento do missionário Octavio Borges, na Chácara Parreiral.' },
        { quando: 'Fev. 2016', texto: 'Com o apoio da IPJC, por meio do Projeto Caminho, as reuniões passam para o salão de festas do Viver Serra.' },
        { quando: 'Dez. 2016', texto: 'Começa um ponto de pregação em salão alugado na Rua Evaristo Veiga, 43.' },
        { quando: 'Jan. 2018', texto: 'O Pr. Ezequias Scherrer assume o pastorado.' },
        { quando: '25/02/2018', texto: 'Culto oficial de organização da Congregação Presbiteriana em Chácara Parreiral.' },
        { quando: '09/03/2025', texto: 'Inauguração do templo em Guaraciaba, na celebração dos 10 anos da congregação.' },
        { quando: 'Jan. 2026', texto: 'O Pr. Oscar Alvarez assume como pastor da congregação.' }
      ],
      endereco: 'Rua Teresa Tironi, 15, Guaraciaba, Serra/ES',
      pastor: 'Pr. Oscar Alvarez', telefone: '(27) 98814-5972',
      email: 'secretaria@ipchacara.org', site: 'https://ipchacara.org',
      instagram: '@ipbchacara',
      foto: 'assets/img/congregacoes/chacara/templo-interior.jpg',
      galeria: [
        { src: 'assets/img/congregacoes/chacara/templo-interior.jpg', legenda: 'O templo, inaugurado em março de 2025' },
        { src: 'assets/img/congregacoes/chacara/fachada.jpg', legenda: 'Fachada, na Rua Teresa Tironi' },
        { src: 'assets/img/congregacoes/chacara/ministerio-infantil.jpg', legenda: 'Espaço do Ministério Infantil' },
        { src: 'assets/img/congregacoes/chacara/entrada.jpg', legenda: 'Entrada' }
      ],
      logo: 'assets/img/congregacoes/chacara-parreiral.png',
      programas: [
        { tipo: 'EBD', descricao: 'Domingos, às 18h — jovens e adultos estudam o Catecismo Maior' },
        { tipo: 'Culto de adoração', descricao: 'Domingos, às 19h30' },
        { tipo: 'Reunião de oração', descricao: 'Terças, às 19h30' }
      ] },
    { slug: 'santa-maria-de-jetiba', nome: 'Congregação Presbiteriana em Santa Maria de Jetibá', cidade: 'Santa Maria de Jetibá/ES',
      resumo: 'Congregação adotada pela IPJC em 2014, na região serrana do Espírito Santo.',
      historia: 'Em 2014, a IPJC adotou a Congregação Presbiteriana em Santa Maria de Jetibá, assumindo o compromisso de cuidar, sustentar e caminhar ao lado dos irmãos da região serrana.',
      endereco: 'Rua da Paz, 140, Vila Nova, Santa Maria de Jetibá/ES, CEP 29645-000',
      pastor: 'Pr. Heber José de Souza', telefone: '(27) 99520-4442',
      instagram: '@ipbemsantamariadejetiba', foto: '',
      logo: 'assets/img/congregacoes/santa-maria-de-jetiba.png',
      programas: [
        { tipo: 'Culto', descricao: 'Domingos, às 9h' },
        { tipo: 'EBD', descricao: 'Domingos, às 10h30' },
        { tipo: 'Culto de oração', descricao: 'Quintas, às 19h' }
      ] }
  ],

  /* ------------------------------------------------------- Dízimos e ofertas
     qr: imagem do QR Code Pix · pixCopiaECola: código lido do mesmo QR. */
  contribuicao: [
    { id: 'sede', aba: 'Sede', titulo: 'Dízimos e ofertas', destino: 'Igreja Presbiteriana em Jardim Camburi',
      tipoChave: 'CNPJ', chave: '02.342.872/0001-63', chaveCopia: '02342872000163',
      titular: 'Igreja Presbiteriana em Jardim Camburi',
      banco: [['Banco', 'Caixa Econômica Federal (104)'], ['Agência', '3084'], ['Conta corrente', '128-8'], ['Operação', '003']],
      qr: 'assets/img/pix/sede.png',
      pixCopiaECola: '00020126360014br.gov.bcb.pix0114023428720001635204000053039865802BR5910----------6007VITORIA62070503***6304B89C' },
    { id: 'chacara', aba: 'Chácara Parreiral', titulo: 'Ofertas — Congregação', destino: 'Congregação Presbiteriana em Chácara Parreiral',
      tipoChave: 'E-mail', chave: 'ipbcp.cp@gmail.com', chaveCopia: 'ipbcp.cp@gmail.com',
      titular: 'Igreja Presbiteriana em Jardim Camburi',
      banco: [['Banco', 'Caixa Econômica Federal (poupança)'], ['Agência', '3084'], ['Código', '1388'], ['Conta', '00738993461-2']],
      qr: 'assets/img/pix/chacara.png',
      pixCopiaECola: '00020126570014br.gov.bcb.pix0118ipbcp.cp@gmail.com0213Construcao CP5204000053039865802BR5910----------6007VITORIA62070503***63040E08' },
    { id: 'santa', aba: 'Santa Maria de Jetibá', titulo: 'Ofertas — Congregação', destino: 'Congregação Presbiteriana em Santa Maria de Jetibá',
      tipoChave: 'Telefone', chave: '(27) 98128-3997', chaveCopia: '+5527981283997',
      titular: 'Igreja Presbiteriana em Jardim Camburi',
      banco: [['Banco', 'Sicoob (756)'], ['Agência', '3010'], ['Conta corrente', '190.640-2']],
      qr: 'assets/img/pix/santa.png',
      pixCopiaECola: '00020126360014br.gov.bcb.pix0114+55279812839975204000053039865802BR5925IGREJA_PRESBITERIANA_EM_J6008Brasilia62290525M0680081531917404242707126304CBCE' }
  ],

  /* ------------------------------------------------------- Social (ONG) */
  social: {
    nome: 'Jardins Cultivando Vidas',
    sigla: 'JCV',
    site: 'https://jardinscultivandovidas.org.br',
    resumo: 'A IPJC apoia a ONG Jardins Cultivando Vidas, uma organização social que atua em Jardim Camburi e região.',
    sobre: '',            // TODO: texto oficial de apresentação da ONG (missão e público atendido)
    instagram: '',        // TODO: @ da ONG
    email: '',            // TODO: confirmar e-mail de contato
    telefone: '(27) 99235-2099',   // WhatsApp da ONG
    video: 'LOt1l717DtE',
    logo: 'assets/img/social/jcv-horizontal.png',
    logoVertical: 'assets/img/social/jcv-vertical.png',
    icone: 'assets/img/social/jcv-icone.png'
  },


  /* ------------------------------------------------------- Quem Somos */
  historia: [
    { ano: '1993', titulo: 'O começo em oração', texto: 'Irmãos começam a se reunir e orar por uma igreja em Jardim Camburi. Segundo os membros fundadores, tudo começou numa conversa entre algumas irmãs enquanto caminhavam pelo Calçadão de Camburi.' },
    { ano: '1995', titulo: 'Congregação organizada', texto: 'Nos dias 27 e 28 de maio, a congregação é organizada na Rua Abídes Viana, 40.' },
    { ano: '1996–97', titulo: 'Primeiros pastores', texto: 'A congregação é pastoreada pelos Revs. Luís Henrique e Tercio Rocha Pinto. Em abril de 1997, muda-se para a Rua Carlos Ramiro Marangoni, 271.' },
    { ano: '1997', titulo: 'Nasce a IPJC', texto: 'Em 14 de dezembro, a congregação é emancipada: nasce a Igreja Presbiteriana em Jardim Camburi, com 122 membros.' },
    { ano: '1999', titulo: 'Endereço atual', texto: 'A igreja se muda para a Rua Carlos Delgado Guerra Pinto, 761.' },
    { ano: '2011', titulo: 'Jardins Cultivando Vidas', texto: 'É fundada a ONG Jardins Cultivando Vidas.' },
    { ano: '2014', titulo: 'Santa Maria de Jetibá', texto: 'A IPJC adota a Congregação Santa Maria de Jetibá.' },
    { ano: '2015', titulo: 'Dois cultos, duas EBDs', texto: 'A igreja passa a ter dois cultos e duas EBDs aos domingos.' },
    { ano: '2016', titulo: 'Projeto Caminho', texto: 'Apoio ao Projeto Caminho, que deu origem à Congregação Presbiteriana em Chácara Parreiral, na Serra.' },
    { ano: '2025', titulo: 'Templo da Chácara Parreiral', texto: 'Em março, é inaugurado o templo da Congregação Presbiteriana em Chácara Parreiral, em Guaraciaba, na Serra, na celebração dos seus 10 anos.' }
  ],

  missao: 'Fazer discípulos de Cristo que adorem a Deus, vivam em comunhão, sejam comprometidos, sirvam com amor e alcancem novas pessoas.',
  visao: 'Uma comunidade de discípulos de Cristo adoradora, unida, comprometida, amorosa e missionária.',
  valores: [
    { nome: 'Adoração', texto: 'Vivemos para a glória de Deus, no culto público e em cada dia da semana.' },
    { nome: 'Comunhão', texto: 'Somos família da fé: caminhamos juntos e cuidamos uns dos outros.' },
    { nome: 'Discipulado', texto: 'Crescemos no conhecimento de Cristo pelo estudo fiel das Escrituras.' },
    { nome: 'Serviço', texto: 'Servimos com amor, dentro e fora da igreja, como Cristo nos serviu.' },
    { nome: 'Evangelização', texto: 'Anunciamos o evangelho e abrimos as portas para novas pessoas.' }
  ],

  /* ------------------------------------------------------- No que Cremos */
  /* Versículos sempre na ARA */
  solas: [
    { nome: 'Sola Scriptura', traducao: 'Somente a Escritura', texto: 'A Bíblia é a regra infalível de fé e prática.',
      versiculo: 'Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça', ref: '2 Timóteo 3.16' },
    { nome: 'Solus Christus', traducao: 'Somente Cristo', texto: 'Cristo é o único mediador entre Deus e as pessoas.',
      versiculo: 'Porquanto há um só Deus e um só Mediador entre Deus e os homens, Cristo Jesus, homem', ref: '1 Timóteo 2.5' },
    { nome: 'Sola Gratia', traducao: 'Somente a graça', texto: 'A salvação é graça de Deus, não mérito humano.',
      versiculo: 'Porque pela graça sois salvos, mediante a fé; e isto não vem de vós; é dom de Deus', ref: 'Efésios 2.8' },
    { nome: 'Sola Fide', traducao: 'Somente a fé', texto: 'A justificação se dá pela fé, não pelas obras.',
      versiculo: 'Justificados, pois, mediante a fé, temos paz com Deus por meio de nosso Senhor Jesus Cristo', ref: 'Romanos 5.1' },
    { nome: 'Soli Deo Gloria', traducao: 'Somente a Deus a glória', texto: 'Toda a vida existe para a glória de Deus.',
      versiculo: 'Portanto, quer comais, quer bebais ou façais outra coisa qualquer, fazei tudo para a glória de Deus', ref: '1 Coríntios 10.31' }
  ],

  doutrinas: [
    { titulo: 'As Escrituras', icone: 'livro', texto: 'Os 66 livros do Antigo e do Novo Testamento são a Palavra de Deus, inspirados e sem erro, suficientes para nos ensinar o caminho da salvação e da vida.' },
    { titulo: 'A Trindade', icone: 'trindade', texto: 'Há um só Deus, que existe eternamente em três pessoas — Pai, Filho e Espírito Santo —, iguais em poder e glória.' },
    { titulo: 'A soberania de Deus', icone: 'coroa', texto: 'Deus governa todas as coisas com sabedoria, justiça e amor. A salvação é obra dele, do começo ao fim.' },
    { titulo: 'A Igreja', icone: 'pessoas', texto: 'A Igreja é o corpo de Cristo, reunido em torno da Palavra e dos sacramentos, para adorar, crescer e servir.' },
    { titulo: 'Os sacramentos', icone: 'calice', texto: 'Cristo instituiu dois sacramentos: o Batismo e a Ceia do Senhor, sinais visíveis e selos da sua graça.' },
    { titulo: 'A esperança', icone: 'sol', texto: 'Aguardamos a volta de Cristo em glória, a ressurreição dos mortos e a vida eterna com Deus.' }
  ],

  westminster: [
    { nome: 'Confissão de Fé', numero: 33, unidade: 'capítulos', texto: 'Exposição sistemática da fé cristã: das Escrituras e de Deus à Igreja, aos sacramentos e às últimas coisas.' },
    { nome: 'Catecismo Maior', numero: 196, unidade: 'perguntas', texto: 'Perguntas e respostas mais extensas, pensadas para o ensino na igreja e para quem conduz o estudo.' },
    { nome: 'Breve Catecismo', numero: 107, unidade: 'perguntas', texto: 'A fé em perguntas curtas, ideal para memorizar e aprender em família.' }
  ]
};

/* ---------------------------------------------------------------------------
   Coleções editáveis (programações, boletins, blog):
   1. js/conteudo.js — versão publicada, gerada pelo admin (window.IPJC_CONTEUDO);
   2. localStorage — alterações feitas no admin neste navegador, ainda não publicadas.
   --------------------------------------------------------------------------- */
window.IPJC_EDITAVEIS = ['programacoes', 'boletins', 'blog'];
(function aplicarConteudo() {
  var publicado = window.IPJC_CONTEUDO || {};
  var local = null;
  try { local = JSON.parse(localStorage.getItem(window.IPJC_STORAGE_KEY) || 'null'); }
  catch (e) { /* localStorage indisponível ou JSON inválido */ }
  window.IPJC_EDITAVEIS.forEach(function (chave) {
    if (Array.isArray(publicado[chave])) window.IPJC[chave] = publicado[chave];
    if (local && Array.isArray(local[chave])) window.IPJC[chave] = local[chave];
  });
})();
