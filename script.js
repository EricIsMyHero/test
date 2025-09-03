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

    const flipButton = document.createElement('button');
    flipButton.className = 'flip-button';

    cardContainer.addEventListener('click', (e) => {
      if (e.target.closest('.flip-button')) {
        cardContainer.classList.toggle('is-flipped');
      }
    });

    cardContainer.appendChild(flipButton);
  } else {
    const singleCard = createCardContent(data);
    singleCard.classList.add('card-single');
    cardContainer.appendChild(singleCard);
  }

  if (data.rarity.toLowerCase() === 'ethereal') {
    const glowDiv = document.createElement('div');
    glowDiv.className = 'card-glow';
    cardContainer.appendChild(glowDiv);
  }

  return cardContainer;
}

function createCardContent(data) {
  const cardContent = document.createElement('div');
  cardContent.innerHTML = `
    <div class="stripe"></div>
    <div class="head">
      <div class="name">${data.name}</div>
      <div class="badge">${data.type.join(', ')}</div>
    </div>
    <div style="height: 120px; background-color: #0f1220; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-image" style="font-size: 48px; color: #8a92b2;"></i>
    </div>
    <div class="card-tabs">
      <button class="active" data-tab-id="main-stats">Əsas</button>
      <button data-tab-id="additional-stats">Əlavə</button>
      <button data-tab-id="trait">Özəllik</button>
      <button data-tab-id="showlevels">Səviyyələr</button>
    </div>
    <div class="stats-section visible" data-section-id="main-stats">
      <div class="stat-item"><b>Can</b><span>${data.stats.health}</span></div>
      <div class="stat-item"><b>Qalxan</b><span>${data.stats.shield}</span></div>
      <div class="stat-item"><b>Hasar</b><span>${data.stats.damage}</span></div>
      <div class="stat-item"><b>SPS</b><span>${data.stats.sps}</span></div>
      <div class="stat-item"><b>Hücum Sürəti</b><span>${data.stats.attackSpeed}</span></div>
      <div class="stat-item"><b>Gecikmə</b><span>${data.stats.delay}</span></div>
      <div class="stat-item"><b>Mana</b><span>${data.stats.mana}</span></div>
      <div class="stat-item"><b>Sayı</b><span>${data.stats.number}</span></div>
    </div>
    <div class="stats-section" data-section-id="additional-stats">
      <div class="stat-item"><b>Mənzil</b><span>${data.additionalStats.range}</span></div>
      <div class="stat-item"><b>Sürət</b><span>${data.additionalStats.speed}</span></div>
      <div class="stat-item"><b>Kritik Şans</b><span>${data.additionalStats.criticalChance}</span></div>
      <div class="stat-item"><b>Can Çalma</b><span>${data.additionalStats.lifestealChance}</span></div>
    </div>
    <div class="stats-section" data-section-id="trait">
      <div class="trait-center">${data.trait}</div>
    </div>
    <div class="stats-section" data-section-id="showlevels">
      <div class="stat-item"><b>Can</b><span>+10</span></div>
      <div class="stat-item"><b>Hasar</b><span>+5</span></div>
      <div class="stat-item"><b>Sürət</b><span>+20</span></div>
    </div>
  `;
  cardContent.querySelector('.card-tabs').addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    cardContent.querySelectorAll('.card-tabs button').forEach(btn => btn.classList.remove('active'));
    cardContent.querySelectorAll('.stats-section').forEach(section => section.classList.remove('visible'));
    button.classList.add('active');
    const tabId = button.getAttribute('data-tab-id');
    const targetSection = cardContent.querySelector(`[data-section-id="${tabId}"]`);
    if (targetSection) {
      targetSection.classList.add('visible');
    }
  });
  return cardContent;
}

let cardsData = [];
const jsonFiles = {
  mundane: 'https://raw.githubusercontent.com/AnarMamedov/clash-and-mana/main/mundane.json',
  familiar: 'https://raw.githubusercontent.com/AnarMamedov/clash-and-mana/main/familiar.json',
  arcane: 'https://raw.githubusercontent.com/AnarMamedov/clash-and-mana/main/arcane.json',
  mythic: 'https://raw.githubusercontent.com/AnarMamedov/clash-and-mana/main/mythic.json',
  legendary: 'https://raw.githubusercontent.com/AnarMamedov/clash-and-mana/main/legendary.json',
  ethereal: 'https://raw.githubusercontent.com/AnarMamedov/clash-and-mana/main/ethereal.json'
};

async function fetchAndRender(rarity) {
  cardsContainer.innerHTML = '<p style="text-align:center; color:var(--muted);">Yüklənir...</p>';
  try {
    let fetchedData = [];
    if (rarity === 'all') {
      const fetchPromises = Object.values(jsonFiles).map(url =>
        fetch(url).then(res => res.ok ? res.json() : [])
      );
      fetchedData = (await Promise.all(fetchPromises)).flat();
    } else {
      const response = await fetch(jsonFiles[rarity]);
      if (!response.ok) throw new Error();
      fetchedData = await response.json();
    }
    cardsData = fetchedData;
    renderCards(cardsData);
  } catch (error) {
    cardsContainer.innerHTML = '<p style="color:red; text-align:center;">Kart məlumatları yüklənərkən xəta baş verdi.</p>';
  }
}

function renderCards(data) {
  cardsContainer.innerHTML = '';
  if (data.length === 0) {
    cardsContainer.innerHTML = '<p style="text-align:center; color:var(--muted);">Bu nadirlik dərəcəsində kart tapılmadı.</p>';
    return;
  }
  data.forEach(cardData => {
    const cardElement = createCardElement(cardData);
    cardsContainer.appendChild(cardElement);
  });
}

showCardsBtn.addEventListener('click', showCards);
backToMenuBtn.addEventListener('click', showMenu);

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
  button.addEventListener('click', () => {
    const rarity = button.id.split('-')[1];
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    fetchAndRender(rarity);
  });
});

document.addEventListener('DOMContentLoaded', showMenu);
