// DOM Elementləri
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');
const loadingSpinner = document.getElementById('loading-spinner');

let allCardsData = [];
let currentFilter = 'all';
let modalCard = null;

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
      const fetches = rarities.map(rarity => fetch(`${rarity}.json`).then(response => response.json()));
      const dataArrays = await Promise.all(fetches);
      allCardsData = dataArrays.flat();
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
    const cardContent = createCardContent(cardData);
    cardContainer.appendChild(cardContent);
    cardContainer.addEventListener('click', () => {
      openCardAsModal(cardContainer);
    });
    cardsContainer.appendChild(cardContainer);
  });
}

function openCardAsModal(cardElement) {
  if (modalCard) return; // Prevent multiple modals
  const clonedCard = cardElement.cloneNode(true);
  clonedCard.classList.add('modal-card-large');
  document.body.appendChild(clonedCard);
  modalCard = clonedCard;

  // Add click listener to close modal
  modalCard.addEventListener('click', () => {
    closeCardModal();
  });
}

function closeCardModal() {
  if (modalCard) {
    modalCard.classList.add('closing');
    modalCard.addEventListener('transitionend', () => {
      if (modalCard && modalCard.parentElement) {
        modalCard.parentElement.removeChild(modalCard);
        modalCard = null;
      }
    }, { once: true });
  }
}

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

['show-spells-btn', 'show-boosters-btn', 'show-towers-btn'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    alert("Bu bölmə hələ hazır deyil.");
  });
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCardModal();
  }
});
