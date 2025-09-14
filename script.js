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
  'mundane': 'https://s.g-c.io/shared/artifacts/uploaded/oyun-main.zip/oyun-main/mundane.json',
  'familiar': 'https://s.g-c.io/shared/artifacts/uploaded/oyun-main.zip/oyun-main/familiar.json',
  'arcane': 'https://s.g-c.io/shared/artifacts/uploaded/oyun-main.zip/oyun-main/arcane.json',
  'mythic': 'https://s.g-c.io/shared/artifacts/uploaded/oyun-main.zip/oyun-main/mythic.json',
  'legendary': 'https://s.g-c.io/shared/artifacts/uploaded/oyun-main.zip/oyun-main/legendary.json',
  'ethereal': 'https://s.g-c.io/shared/artifacts/uploaded/oyun-main.zip/oyun-main/ethereal.json'
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
  
  if (data.isHybrid || data.isMulti) {
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
      cardContainer.classList.toggle('is-flipped');
    });
  } else {
    const cardSingle = createCardContent(data);
    cardSingle.classList.add('card-single');
    cardContainer.appendChild(cardSingle);
  }
  return cardContainer;
}

// Kartın daxili məzmununu yaratmaq üçün funksiya
function createCardContent(data) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card-content';
  
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  cardBody.innerHTML = `
    <h2>${data.name}</h2>
    <p>${data.type.join(' / ')}</p>
    <p>Nadirlik: ${data.rarity}</p>
    <p>Qeyd: ${data.note}</p>
  `;

  const cardStats = document.createElement('div');
  cardStats.className = 'card-stats';
  cardStats.innerHTML = `
    <div class="stat-item"><h3>${data.stats.health}</h3><p>Can</p></div>
    <div class="stat-item"><h3>${data.stats.damage}</h3><p>Hasar</p></div>
    <div class="stat-item"><h3>${data.stats.mana}</h3><p>Mana</p></div>
  `;
  
  const cardTrait = document.createElement('div');
  cardTrait.className = 'card-trait';
  cardTrait.innerHTML = `<p>${data.trait}</p>`;
  
  const cardLevels = document.createElement('div');
  cardLevels.className = 'card-levels';
  const levelList = data.showlevels ? `<ul>${Object.values(data.showlevels).map(level => `<li>${level}</li>`).join('')}</ul>` : '';
  cardLevels.innerHTML = `
    <h4>Səviyyə artırımı</h4>
    ${levelList}
  `;

  cardDiv.appendChild(cardBody);
  cardDiv.appendChild(cardStats);
  cardDiv.appendChild(cardTrait);
  cardDiv.appendChild(cardLevels);
  
  return cardDiv;
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
    setTimeout(() => { document.body.removeChild(modal); }, 3000);
  });
});
