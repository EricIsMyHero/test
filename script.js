// DOM Elementləri
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');

function showMenu() {
  mainMenu.classList.remove('hidden');
  cardsSection.classList.add('hidden');
}

function showCards() {
  mainMenu.classList.add('hidden');
  cardsSection.classList.remove('hidden');
  fetchAndRender('all');
}

// Kartın məzmununu (stat, trait, levels) yaratmaq üçün köməkçi funksiya
function createCardContent(data, type) {
    const content = document.createElement('div');
    content.className = 'card-content';

    const statHtml = `
        <!-- Kartın əsas statları (hər zaman görünən) -->
        <div class="stat-group main-stats">
      <div class="stat-item"><b>Can <i class="fa-solid fa-heart"></i></b><span>${data.stats.health}</span></div>
      <div class="stat-item"><b>Qalxan <i class="fa-solid fa-shield-halved"></i></b><span>${data.stats.shield}</span></div>
      <div class="stat-item"><b>Hasar <i class="fa-solid fa-hand-fist"></i></b><span>${data.stats.damage}</span></div>
      <div class="stat-item"><b>S.B.H <i class="fa-solid fa-bolt"></i></b><span>${data.stats.sps}</span></div>
      <div class="stat-item"><b>Saldırı Hızı <i class="fa-solid fa-tachometer-alt"></i></b><span>${data.stats.attackSpeed}</span></div>
      <div class="stat-item"><b>Gecikmə <i class="fa-solid fa-clock"></i></b><span>${data.stats.delay}</span></div>
      <div class="stat-item"><b>Mana <i class="fa-solid fa-certificate"></i></b><span>${data.stats.mana}</span></div>
      <div class="stat-item"><b>Say <i class="fa-solid fa-user"></i></b><span>${data.stats.number}</span></div>
        </div>
    `;

    const additionalHtml = `
        <!-- Əlavə Statlar (Gizli) -->
        <div class="stat-group hidden" data-tab="additional">
            <div class="stat-item"><b>Menzil <i class="fa-solid fa-road"></i></b><span>${data.additionalStats.range}</span></div>
            <div class="stat-item"><b>Hız <i class="fa-solid fa-person-running"></i></b><span>${data.additionalStats.speed}</span></div>
            <div class="stat-item"><b>Kritik Şansı <i class="fa-solid fa-percent"></i></b><span>${data.additionalStats.criticalChance}</span></div>
            <div class="stat-item"><b>Kritik Hasar <i class="fa-solid fa-crosshairs"></i></b><span>${data.additionalStats.criticDamage}</span></div>
            <div class="stat-item"><b>C.Çalma Şansı <i class="fa-solid fa-percent "></i></b><span>${data.additionalStats.lifestealChance}</span></div>
            <div class="stat-item"><b>Can Çalma <i class="fa-solid fa-skull-crossbones "></i></b><span>${data.additionalStats.lifesteal}</span></div>
            <div class="stat-item"><b>Hasar Azaltma <i class="fa-solid fa-helmet-un "></i></b><span>${data.additionalStats.damageminimiser}</span></div>
            <div class="stat-item"><b>Sıyrılma Şansı <i class="fa-solid fa-wind "></i></b><span>${data.additionalStats.dodge}</span></div>
        </div>
    `;

    const traitHtml = `
        <!-- Özəllik (Gizli) -->
        <div class="stat-group hidden" data-tab="trait">
            <p>${data.trait}</p>
        </div>
    `;

    const levelsHtml = `
        <!-- Səviyyələr (Gizli) -->
        <div class="stat-group hidden" data-tab="levels">
            <div class="stat-item"><b>Səviyyə 1</b><span>${data.showlevels.level1}</span></div>
            <div class="stat-item"><b>Səviyyə 2</b><span>${data.showlevels.level2}</span></div>
            <div class="stat-item"><b>Səviyyə 3</b><span>${data.showlevels.level3}</span></div>
        </div>
    `;

    // Kartın üst hissəsi: Ad, Rarity, Tip
    content.innerHTML = `
        <header class="card-header">
            <h3>${data.name}</h3>
            <span class="card-rarity">${data.rarity}</span>
            <span class="card-type">${data.type.join(' | ')}</span>
        </header>

        <!-- Kartın daxilindəki əsas məzmun (Statlar/Özəlliklər/Səviyyələr) -->
        <div class="card-body">
            <div class="card-stats">
                ${statHtml}
                ${additionalHtml}
                ${traitHtml}
                ${levelsHtml}
            </div>

            <!-- Yeni: Düymələr sağ tərəfdə olacaq -->
            <div class="card-buttons">
                <button class="tab-button active" data-tab-name="main">Əsas</button>
                <button class="tab-button" data-tab-name="additional">Əlavə</button>
                <button class="tab-button" data-tab-name="trait">Özəllik</button>
                <button class="tab-button" data-tab-name="levels">Səviyyələr</button>
            </div>
        </div>

    `;

    // Tablar üçün məntiq (createCardElement-də işlənəcək)
    return content;
}

// Kart yaratmaq üçün əsas funksiya
function createCardElement(data) {
    const cardContainer = document.createElement('article');
    cardContainer.className = `card-container card r-${data.rarity.toLowerCase()}`;
    
    if (data.isMulti) {
        // Multi Kartlar üçün (Flip funksiyası)
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const cardFront = createCardContent(data, 'front');
        cardFront.classList.add('card-front');
        
        const cardBack = createCardContent(data.secondForm, 'back');
        cardBack.classList.add('card-back');

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardContainer.appendChild(cardInner);

        const flipButton = document.createElement('button');
        flipButton.className = 'flip-button';

        cardContainer.addEventListener('click', (e) => {
            if (e.target.closest('.flip-button')) {
                cardContainer.classList.toggle('flipped');
            } else if (!e.target.closest('.tab-button')) {
                // Flip düyməsinə basmayanda və tab düyməsinə basmayanda flip et
                cardContainer.classList.toggle('flipped');
            }
        });

    } else {
        // Normal (Single) Kartlar üçün
        const cardSingle = createCardContent(data, 'single');
        cardSingle.classList.add('card-single');
        cardContainer.appendChild(cardSingle);
    }
    
    // TAB funksionalı
    const tabButtons = cardContainer.querySelectorAll('.tab-button');
    const tabContents = cardContainer.querySelectorAll('.stat-group:not(.main-stats)');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab-name');

            // Bütün düymələrdən 'active' klassını sil
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Cari düyməyə 'active' klassını əlavə et
            button.classList.add('active');

            // Bütün gizli məzmunu gizlət
            tabContents.forEach(content => content.classList.add('hidden'));

            // Əsas statları göstər və ya gizlət
            const mainStats = cardContainer.querySelector('.main-stats');
            if (tabName === 'main') {
                mainStats.classList.remove('hidden');
            } else {
                mainStats.classList.add('hidden');
                // Seçilmiş tab məzmununu göstər
                const selectedContent = cardContainer.querySelector(`.stat-group[data-tab="${tabName}"]`);
                if (selectedContent) {
                    selectedContent.classList.remove('hidden');
                }
            }
        });
    });

    return cardContainer;
}

// Kartları render edən əsas funksiya
function renderCards(cards) {
  cardsContainer.innerHTML = '';
  if (cards.length === 0) {
    cardsContainer.innerHTML = '<p class="no-cards">Seçilmiş nadirlik səviyyəsində kart tapılmadı.</p>';
    return;
  }
  cards.forEach(card => {
    cardsContainer.appendChild(createCardElement(card));
  });
}

// Məlumatları gətirib render edən funksiya
async function fetchAndRender(rarity) {
  let cardsData = [];
  const rarityFiles = {
    'all': ['mundane.json', 'familiar.json', 'arcane.json', 'mythic.json', 'legendary.json', 'ethereal.json'],
    'mundane': ['mundane.json'],
    'familiar': ['familiar.json'],
    'arcane': ['arcane.json'],
    'mythic': ['mythic.json'],
    'legendary': ['legendary.json'],
    'ethereal': ['ethereal.json']
  };

  try {
    const files = rarityFiles[rarity];
    for (const file of files) {
      const response = await fetch(file);
      if (response.ok) {
        // Kontrol et, əgər fayl boşdursa, JSON.parse xəta verə bilər
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) === 0) {
            cardsData = [];
        } else {
            const data = await response.json();
            cardsData.push(...data);
        }
      } else {
        const text = await response.text();
        // Boş response halını idarə et
        cardsData = text ? JSON.parse(text) : [];
      }
    }
    renderCards(cardsData);
  } catch (error) {
    console.error('Məlumatları yükləmə zamanı xəta:', error);
    cardsContainer.innerHTML = '<p style="color:red;">Kart məlumatları yüklənərkən xəta baş verdi.</p>';
  }
}


showCardsBtn.addEventListener('click', showCards);
backToMenuBtn.addEventListener('click', showMenu);

// Hələ hazır olmayan bölmələr üçün modal
['show-spells-btn','show-boosters-btn','show-towers-btn'].forEach(id=>{
  document.getElementById(id).addEventListener('click',()=>{
    const modal=document.createElement('div');
    modal.style.position='fixed';
    modal.style.top='50%';
    modal.style.left='50%';
    modal.style.transform='translate(-50%, -50%)';
    modal.style.padding='20px';
    modal.style.backgroundColor='var(--card)';
    modal.style.color='var(--text)';
    modal.style.borderRadius='12px';
    modal.style.boxShadow='var(--shadow)';
    modal.style.zIndex='1000';
    modal.textContent="Bu bölmə hələ hazır deyil.";
    document.body.appendChild(modal);
    setTimeout(()=>{document.body.removeChild(modal);},3000);
  });
});

filterButtons.forEach(button => {
  button.addEventListener('click', function() {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    const rarity = this.id.replace('filter-', '');
    fetchAndRender(rarity);
  });
});
