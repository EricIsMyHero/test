// DOM Elementləri
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');

// Nadirlik adlarını JSON fayl adlarına uyğunlaşdırır
const rarityFiles = {
  all: ['mundane', 'familiar', 'arcane', 'mythic', 'legendary', 'ethereal'],
  mundane: ['mundane'],
  familiar: ['familiar'],
  arcane: ['arcane'],
  mythic: ['mythic'],
  legendary: ['legendary'],
  ethereal: ['ethereal']
};

let allCardsData = [];

// Menyu və kartlar bölməsini göstər/gizlə
function showMenu() {
  mainMenu.classList.remove('hidden');
  cardsSection.classList.add('hidden');
}

function showCards() {
  mainMenu.classList.add('hidden');
  cardsSection.classList.remove('hidden');
  fetchAndRender('all');
}

// Kart məzmunu yaratmaq üçün funksiya
function createCardContent(data) {
  const content = document.createElement('div');
  content.className = 'card-content stats-view';

  // Başlıq və nadirlik
  const header = document.createElement('header');
  header.innerHTML = `<span class="name">${data.name}</span> <span class="rarity"><span>${data.rarity}</span></span>`;
  content.appendChild(header);

  // Statistika cədvəli
  const statsTable = document.createElement('div');
  statsTable.className = 'stats-table';
  
  // Əsas statistika
  for (const stat in data.stats) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `<span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}</span> <span class="stat-value">${data.stats[stat]}</span>`;
    statsTable.appendChild(row);
  }
  
  content.appendChild(statsTable);
  
  // Xüsusiyyət (trait)
  const trait = document.createElement('p');
  trait.className = 'trait';
  trait.innerHTML = `Xüsusiyyət: ${data.trait}`;
  content.appendChild(trait);

  // Əlavə statistika
  const additionalStatsHeader = document.createElement('h3');
  additionalStatsHeader.textContent = "Əlavə Statistika";
  content.appendChild(additionalStatsHeader);
  const additionalStatsTable = document.createElement('div');
  additionalStatsTable.className = 'stats-table';
  for (const stat in data.additionalStats) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `<span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1).replace(/([A-Z])/g, ' $1')}</span> <span class="stat-value">${data.additionalStats[stat]}</span>`;
    additionalStatsTable.appendChild(row);
  }
  content.appendChild(additionalStatsTable);
  
  // Səviyyələr
  const levelsHeader = document.createElement('h3');
  levelsHeader.textContent = "Səviyyələr";
  content.appendChild(levelsHeader);
  const levelsList = document.createElement('ul');
  levelsList.className = 'levels-list';
  for (const level in data.showlevels) {
    const li = document.createElement('li');
    li.innerHTML = `<b>${level.replace('level', 'Səviyyə ')}:</b> ${data.showlevels[level]}`;
    levelsList.appendChild(li);
  }
  content.appendChild(levelsList);

  return content;
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
      // Düyməyə basıldıqda çevrilməni ləğv edin
      if (e.target.tagName === 'BUTTON') {
        return;
      }
      cardContainer.classList.toggle('is-flipped');
    });

  } else {
    const cardSingle = createCardContent(data);
    cardSingle.classList.add('card-single');
    cardContainer.appendChild(cardSingle);
  }
  
  return cardContainer;
}

// Kartları göstərən funksiya
function renderCards(cards) {
  cardsContainer.innerHTML = '';
  cards.forEach(cardData => {
    const cardElement = createCardElement(cardData);
    cardsContainer.appendChild(cardElement);
  });
}

// Məlumatları gətirmək və göstərmək üçün funksiya
async function fetchAndRender(rarity) {
  try {
    const filesToFetch = rarityFiles[rarity];
    let cardsData = [];

    for (const file of filesToFetch) {
      const response = await fetch(`${file}.json`);
      if (response.ok) {
        const data = await response.json();
        cardsData = cardsData.concat(data);
      } else {
        console.error(`Error loading data for ${file}.json: ${response.status}`);
      }
    }
    
    allCardsData = cardsData;
    renderCards(cardsData);
  } catch (error) {
    console.error('Məlumatları yükləmə zamanı xəta:', error);
    cardsContainer.innerHTML = '<p style="color:red;">Kart məlumatları yüklənərkən xəta baş verdi.</p>';
  }
}

// Düymə hadisələri
showCardsBtn.addEventListener('click', showCards);
backToMenuBtn.addEventListener('click', showMenu);

// Filter düymələri
filterButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    // Aktiv düyməni dəyişdir
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const filterType = e.target.id.replace('filter-', '');
    if (filterType === 'all') {
        renderCards(allCardsData);
    } else {
        const filteredCards = allCardsData.filter(card => card.rarity.toLowerCase() === filterType);
        renderCards(filteredCards);
    }
  });
});

// Hazır olmayan bölmələr üçün pop-up
['show-spells-btn','show-boosters-btn','show-towers-btn'].forEach(id=>{
  document.getElementById(id).addEventListener('click',()=> {
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

// Səhifə yüklənəndə menyunu göstər
window.onload = showMenu;
