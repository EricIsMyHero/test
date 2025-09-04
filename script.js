// DOM Elementləri
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');
const loadingSpinner = document.getElementById('loading-spinner');
const cardModal = document.getElementById('card-modal');
const modalCardDetails = document.getElementById('modal-card-details');
const closeModalBtn = document.querySelector('.close-button');

let allCardsData = [];
let currentFilter = 'all';

function showMenu() {
  mainMenu.classList.remove('hidden');
  cardsSection.classList.add('hidden');
}

function showCards() {
  mainMenu.classList.add('hidden');
  cardsSection.classList.remove('hidden');
  loadUserPreferences();
  fetchAndRender(currentFilter);
}

// Kart məlumatlarını çəkən və göstərən funksiya
async function fetchAndRender(filter) {
  loadingSpinner.classList.remove('hidden');
  cardsContainer.innerHTML = '';
  currentFilter = filter;

  try {
    if (allCardsData.length === 0) {
      const rarities = ['arcane', 'ethereal', 'familiar', 'legendary', 'mundane', 'mythic'];
      for (const rarity of rarities) {
        const response = await fetch(`${rarity}.json`);
        if (!response.ok) throw new Error(`HTTP xətası! status: ${response.status}`);
        const data = await response.json();
        allCardsData = allCardsData.concat(data);
      }
    }
    
    let filteredData = allCardsData;
    if (filter !== 'all') {
      filteredData = allCardsData.filter(card => card.rarity.toLowerCase() === filter);
    }
    
    renderCards(filteredData);
  } catch (error) {
    console.error('Məlumatları yükləmə zamanı xəta:', error);
    cardsContainer.innerHTML = '<p style="color:red;">Kart məlumatları yüklənərkən xəta baş verdi.</p>';
  } finally {
    loadingSpinner.classList.add('hidden');
  }
}

function createCardContent(data) {
  const content = document.createElement('div');
  content.className = 'card-content';
  content.innerHTML = `
      <div class="card-image">
          <img src="https://via.placeholder.com/150" alt="${data.name}">
      </div>
      <div class="card-info">
          <h3 class="card-name">${data.name}</h3>
          <p class="card-rarity r-${data.rarity.toLowerCase()}">${data.rarity}</p>
          <p class="card-type">${data.type.join(', ')}</p>
      </div>
  `;
  return content;
}

function renderCards(cards) {
  cardsContainer.innerHTML = '';
  if (cards.length === 0) {
    cardsContainer.innerHTML = '<p>Bu kateqoriyada kart yoxdur.</p>';
  }
  cards.forEach(cardData => {
    const cardContainer = document.createElement('article');
    cardContainer.className = `card-container card r-${cardData.rarity.toLowerCase()}`;
    
    cardContainer.onclick = () => showCardDetails(cardData);

    const cardContent = createCardContent(cardData);
    cardContainer.appendChild(cardContent);
    cardsContainer.appendChild(cardContainer);
  });
}

// Kart detallarını modalda göstərən funksiya
function showCardDetails(cardData) {
  modalCardDetails.innerHTML = `
    <h2>${cardData.name}</h2>
    <p><strong>Nadirliyi:</strong> <span class="r-${cardData.rarity.toLowerCase()}">${cardData.rarity}</span></p>
    <p><strong>Növü:</strong> ${cardData.type.join(', ')}</p>
    ---
    <h3>Statistikalar</h3>
    <div class="modal-stats">
        <div class="modal-stat-item"><strong>Can:</strong> ${cardData.stats.health}</div>
        <div class="modal-stat-item"><strong>Qalxan:</strong> ${cardData.stats.shield}</div>
        <div class="modal-stat-item"><strong>Zərər:</strong> ${cardData.stats.damage}</div>
        <div class="modal-stat-item"><strong>Vuruş Sürəti:</strong> ${cardData.stats.attackSpeed}</div>
        <div class="modal-stat-item"><strong>Mana:</strong> ${cardData.stats.mana}</div>
    </div>
    ---
    <h3>Xüsusiyyətlər</h3>
    <p>${cardData.trait}</p>
  `;
  cardModal.classList.remove('hidden');
}

// Modal pəncərəni bağlayan funksiya
closeModalBtn.onclick = () => {
  cardModal.classList.add('hidden');
};

// Pəncərənin hər hansı bir yerinə basanda modalları bağlayın
window.onclick = (event) => {
  if (event.target == cardModal) {
    cardModal.classList.add('hidden');
  }
};

// İstifadəçi seçimlərini yadda saxlamaq üçün funksiyalar
function saveUserPreferences() {
  localStorage.setItem('lastFilter', currentFilter);
}

function loadUserPreferences() {
  const lastFilter = localStorage.getItem('lastFilter');
  if (lastFilter) {
    currentFilter = lastFilter;
    filterButtons.forEach(button => {
      if (button.id === `filter-${currentFilter}`) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
}

// Event Listeners
showCardsBtn.addEventListener('click', showCards);
backToMenuBtn.addEventListener('click', () => {
  showMenu();
  saveUserPreferences();
});

filterButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    const filterId = e.target.id.replace('filter-', '');
    fetchAndRender(filterId);
    saveUserPreferences();
  });
});

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
