// Bu fayl yalnız JavaScript məntiqini ehtiva edir.

// DOM Elementləri
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

// Bütün kart məlumatlarını saxlamaq üçün global dəyişən
let allCardsData = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'name';

// Faylların adları nadirlikə görə
const rarityFiles = {
  'mundane': 'mundane.json',
  'familiar': 'familiar.json',
  'arcane': 'arcane.json',
  'mythic': 'mythic.json',
  'legendary': 'legendary.json',
  'ethereal': 'ethereal.json'
};

// Menyu və kart bölmələri arasında keçid
function showMenu() {
  mainMenu.classList.remove('hidden');
  cardsSection.classList.add('hidden');
}

async function showCards() {
  mainMenu.classList.add('hidden');
  cardsSection.classList.remove('hidden');
  if (allCardsData.length === 0) {
    await loadAllCards();
  }
  updateCardDisplay();
}

// Bütün kart məlumatlarını yükləmək üçün funksiya
async function loadAllCards() {
  try {
    const fetchPromises = Object.values(rarityFiles).map(url => fetch(url).then(response => {
      if (!response.ok) {
        console.error(`Fayl yüklənərkən xəta: ${url}, Status: ${response.status}`);
        return [];
      }
      return response.json();
    }).catch(error => {
      console.error(`Fayl yüklənərkən xəta: ${url}`, error);
      return [];
    }));

    const results = await Promise.all(fetchPromises);
    allCardsData = results.flat();
    console.log("Bütün kartlar uğurla yükləndi.");

  } catch (error) {
    console.error('Bütün məlumatları yükləmə zamanı xəta:', error);
    cardsContainer.innerHTML = '<p style="color:red;">Kart məlumatları yüklənərkən xəta baş verdi.</p>';
  }
}

// Kart yaratmaq üçün əsas funksiya
function createCardElement(data) {
  const cardContainer = document.createElement('article');
  cardContainer.className = `card-container card r-${data.rarity.toLowerCase()}`;

  if (data.isMulti) {
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    const cardFront = createCardContent(data);
    cardFront.classList.add('card-front');

    const cardBack = createCardContent(data.secondForm);
    cardBack.classList.add('card-back');

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    cardContainer.appendChild(cardInner);

    cardContainer.addEventListener('click', (e) => {
      // Flip button'a basanda kartın çevrilməsini təmin edir
      cardContainer.classList.toggle('is-flipped');
    });
  } else {
    const singleCard = createCardContent(data);
    singleCard.classList.add('card-single');
    cardContainer.appendChild(singleCard);
  }

  if (data.rarity.toLowerCase() === 'ethereal') {
    const glowDiv = document.createElement('div');
    glowDiv.className = 'card-glow';
    glowDiv.setAttribute('aria-hidden', 'true');
    cardContainer.appendChild(glowDiv);
  }

  return cardContainer;
}

// Kartın iç məzmununu yaradan köməkçi funksiya
function createCardContent(data) {
  const content = document.createElement('div');
  const badgeText = data.isHybrid ? `${data.type[0]}/${data.type[1]}` : data.type[0];
  content.innerHTML = `
    <div class="stripe"></div>
    <div class="head">
      <div class="name">
        ${data.name}
        ${data.note ? `<span class="note">${data.note}</span>` : ""}
      </div>
      <span class="badge">${badgeText}</span>
    </div>

    <div class="card-tabs">
      <button class="active" data-section="main-stats">Əsas</button>
      <button data-section="additional-stats">Əlavə</button>
      <button data-section="trait">Özəllik</button>
      <button data-section="showlevels">Səviyyələr</button>
    </div>

    <div class="stats-section visible" data-section-id="main-stats">
      <div class="stat-item"><b>Can <i class="fa-solid fa-heart"></i></b><span>${data.stats.health}</span></div>
      <div class="stat-item"><b>Qalxan <i class="fa-solid fa-shield-halved"></i></b><span>${data.stats.shield}</span></div>
      <div class="stat-item"><b>Hasar <i class="fa-solid fa-hand-fist"></i></b><span>${data.stats.damage}</span></div>
      <div class="stat-item"><b>S.B.H <i class="fa-solid fa-bolt"></i></b><span>${data.stats.sps}</span></div>
      <div class="stat-item"><b>Saldırı Hızı <i class="fa-solid fa-tachometer-alt"></i></b><span>${data.stats.attackSpeed}</span></div>
      <div class="stat-item"><b>Gecikmə <i class="fa-solid fa-clock"></i></b><span>${data.stats.delay}</span></div>
      <div class="stat-item"><b>Mana <i class="fa-solid fa-certificate"></i></b><span>${data.stats.mana}</span></div>
      <div class="stat-item"><b>Say <i class="fa-solid fa-user"></i></b><span>${data.stats.number}</span></div>
    </div>

    <div class="stats-section" data-section-id="additional-stats">
      <div class="stat-item"><b>Menzil <i class="fa-solid fa-road"></i></b><span>${data.additionalStats.range}</span></div>
      <div class="stat-item"><b>Hız <i class="fa-solid fa-person-running"></i></b><span>${data.additionalStats.speed}</span></div>
      <div class="stat-item"><b>Kritik Şansı <i class="fa-solid fa-percent"></i></b><span>${data.additionalStats.criticalChance}</span></div>
      <div class="stat-item"><b>Kritik Hasar <i class="fa-solid fa-crosshairs"></i></b><span>${data.additionalStats.criticDamage}</span></div>
      <div class="stat-item"><b>C.Çalma Şansı <i class="fa-solid fa-percent "></i></b><span>${data.additionalStats.lifestealChance}</span></div>
      <div class="stat-item"><b>Can Çalma <i class="fa-solid fa-skull-crossbones "></i></b><span>${data.additionalStats.lifesteal}</span></div>
      <div class="stat-item"><b>Hasar Azaltma <i class="fa-solid fa-helmet-un "></i></b><span>${data.additionalStats.damageminimiser}</span></div>
      <div class="stat-item"><b>Sıyrılma Şansı <i class="fa-solid fa-wind "></i></b><span>${data.additionalStats.dodge}</span></div>
    </div>

    <div class="stats-section" data-section-id="trait">
      <div class="trait trait-center">${data.trait}</div>
    </div>

    <div class="stats-section" data-section-id="showlevels">
      <div class="stat-item"><b>Səviyyə 1</b><span>${data.showlevels.level1}</span></div>
      <div class="stat-item"><b>Səviyyə 2</b><span>${data.showlevels.level2}</span></div>
      <div class="stat-item"><b>Səviyyə 3</b><span>${data.showlevels.level3}</span></div>
    </div>
  `;

  const cardButtons = content.querySelectorAll('.card-tabs button');
  cardButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const sectionId = button.dataset.section;

      cardButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      content.querySelectorAll('.stats-section').forEach(section => {
        section.classList.remove('visible');
      });
      content.querySelector(`[data-section-id="${sectionId}"]`).classList.add('visible');
    });
  });

  return content;
}

// Kartları süzgəcdən keçirib render etmək
function updateCardDisplay() {
  let filteredCards = allCardsData;

  // Süzgəcdən keçirmə
  if (currentFilter !== 'all') {
    filteredCards = allCardsData.filter(card => card.rarity.toLowerCase() === currentFilter);
  }

  // Axtarış süzgəci
  if (currentSearch) {
    filteredCards = filteredCards.filter(card =>
      card.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
      (card.note && card.note.toLowerCase().includes(currentSearch.toLowerCase()))
    );
  }

  // Sıralama
  if (currentSort === 'name') {
    filteredCards.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'rarity') {
    const rarityOrder = ['mundane', 'familiar', 'arcane', 'mythic', 'legendary', 'ethereal'];
    filteredCards.sort((a, b) => rarityOrder.indexOf(a.rarity.toLowerCase()) - rarityOrder.indexOf(b.rarity.toLowerCase()));
  } else {
    filteredCards.sort((a, b) => {
      const aVal = parseFloat(a.stats[currentSort]);
      const bVal = parseFloat(b.stats[currentSort]);
      return bVal - aVal; // Böyükdən kiçiyə sıralama
    });
  }

  // Kartları ekrana əlavə etmək
  cardsContainer.innerHTML = '';
  if (filteredCards.length > 0) {
    filteredCards.forEach(cardData => {
      const cardElement = createCardElement(cardData);
      cardsContainer.appendChild(cardElement);
    });
  } else {
    cardsContainer.innerHTML = '<p style="text-align: center; color: var(--muted);">Heç bir kart tapılmadı.</p>';
  }
}

// Event dinləyiciləri
showCardsBtn.addEventListener('click', showCards);
backToMenuBtn.addEventListener('click', showMenu);

// Nadirlik filtrləri
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.id.replace('filter-', '');
    updateCardDisplay();
  });
});

// Axtarış funksiyası
searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value.trim();
  updateCardDisplay();
});

// Sıralama funksiyası
sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  updateCardDisplay();
});

// Digər düymələr üçün modal
['show-spells-btn', 'show-boosters-btn', 'show-towers-btn'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.padding = '20px';
    modal.style.backgroundColor = 'var(--card)';
    modal.style.color = 'var(--text)';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = 'var(--shadow)';
    modal.style.zIndex = '1000';
    modal.textContent = "Bu bölmə hələ hazır deyil.";
    document.body.appendChild(modal);
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 3000);
  });
});

document.addEventListener('DOMContentLoaded', showMenu);
