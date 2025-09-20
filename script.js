// DOM Elementləri
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');

let cardsData = []; // Bütün kart məlumatlarını saxlamaq üçün dəyişən

function showMenu() {
  mainMenu.classList.remove('hidden');
  cardsSection.classList.add('hidden');
}

function showCards() {
  mainMenu.classList.add('hidden');
  cardsSection.classList.remove('hidden');
  fetchAndRender('all');
}

// Kart yaratmaq üçün əsas funksiya
function createCardElement(data) {
  const cardContainer = document.createElement('article');
  cardContainer.className = `card-container r-${data.rarity.toLowerCase()}`;

  const cardContent = document.createElement('div');
  cardContent.className = 'card-content';
  cardContent.innerHTML = `
      <div class="card-header">
        <h2 class="card-title">${data.name}</h2>
        <span class="card-subtitle">${data.rarity}</span>
      </div>
      <img src="https://placehold.co/250x300/4CAF50/white?text=${data.name}" alt="${data.name}" class="card-image">
      <div class="card-trait">
        <p>${data.trait}</p>
      </div>
      <div class="card-stats">
        <div class="card-stat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <span class="stat-value">${data.stats.health}</span>
          <span class="stat-label">Can</span>
        </div>
        <div class="card-stat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span class="stat-value">${data.stats.shield}</span>
          <span class="stat-label">Qalxan</span>
        </div>
        <div class="card-stat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-swords"><polyline points="16 16 12 12 8 8 16 16"></polyline><path d="M20 4L4 20"></path><path d="M20 4l-4 4"></path><path d="M4 20l4-4"></path></svg>
          <span class="stat-value">${data.stats.damage}</span>
          <span class="stat-label">Hasar</span>
        </div>
        <div class="card-stat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span class="stat-value">${data.stats.sps}</span>
          <span class="stat-label">SPS</span>
        </div>
        <div class="card-stat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-watch"><circle cx="12" cy="12" r="7"></circle><polyline points="12 9 12 12 16 14"></polyline><path d="M16.5 16.5L20 20"></path><path d="M7.5 7.5L4 4"></path><path d="M4 20L7.5 16.5"></path><path d="M20 4L16.5 7.5"></path></svg>
          <span class="stat-value">${data.stats.attackSpeed}</span>
          <span class="stat-label">At. sürəti</span>
        </div>
        <div class="card-stat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-crosshair"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="2" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
          <span class="stat-value">${data.stats.range}</span>
          <span class="stat-label">Mənzil</span>
        </div>
      </div>
  `;

  const cardButtons = document.createElement('div');
  cardButtons.className = 'card-buttons';
  
  // Yeni düymələr
  const roleBtn = createButton('Rol', 'role');
  const storyBtn = createButton('Hekayə', 'story');
  
  cardButtons.appendChild(roleBtn);
  cardButtons.appendChild(storyBtn);
  
  cardContainer.appendChild(cardContent);
  cardContainer.appendChild(cardButtons);

  return cardContainer;
}

function createButton(text, type) {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', () => {
    showInfo(type);
  });
  return button;
}

function showInfo(type) {
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
  modal.textContent = `Bu bölmə hələ hazır deyil: ${type}`;
  document.body.appendChild(modal);
  setTimeout(() => {
    document.body.removeChild(modal);
  }, 3000);
}

// JSON məlumatlarını yükləyin və kartları göstərin
async function fetchAndRender(filter) {
  try {
    let cardFiles = ['mundane', 'familiar', 'arcane', 'mythic', 'legendary', 'ethereal'];
    cardsData = []; // Məlumatları sıfırlayın

    for (const file of cardFiles) {
      const response = await fetch(`./${file}.json`);
      if (response.ok) {
        const data = await response.json();
        cardsData = cardsData.concat(data);
      } else {
        console.error(`Fayl yüklənərkən xəta: ${file}.json - Status: ${response.status}`);
      }
    }
    renderCards(cardsData);
  } catch (error) {
    console.error('Məlumatları yükləmə zamanı xəta:', error);
    cardsContainer.innerHTML = '<p style="color:red;">Kart məlumatları yüklənərkən xəta baş verdi.</p>';
  }
}

function renderCards(data) {
  cardsContainer.innerHTML = '';
  data.forEach(card => {
    cardsContainer.appendChild(createCardElement(card));
  });
}

showCardsBtn.addEventListener('click', showCards);
backToMenuBtn.addEventListener('click', showMenu);

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

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const filterType = button.id.replace('filter-', '');
    if (filterType === 'all') {
      renderCards(cardsData);
    } else {
      const filteredData = cardsData.filter(card => card.rarity.toLowerCase() === filterType);
      renderCards(filteredData);
    }
  });
});
