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

// Kart yaratmaq üçün əsas funksiya
function createCardElement(data) {
  const cardContainer = document.createElement('article');
  cardContainer.className = `card-container card r-${data.rarity.toLowerCase()}`;

  const singleCard = createCardContent(data);
  singleCard.classList.add('card-single');
  cardContainer.appendChild(singleCard);

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
      <div class="name">${data.name}${data.note ? `<span class="note">${data.note}</span>` : ""}</div>
      <span class="badge">${badgeText}</span>
    </div>

    <div class="card-tabs">
      <button class="active" data-section="main-stats">Əsas</button>
      <button data-section="additional-stats">Əlavə</button>
      <button data-section="trait">Özəllik</button>
      <button data-section="showlevels">Səviyyələr</button>
    </div>

    <div class="stats-section visible" data-section-id="main-stats">
      <div class="stat-item"><b>Can</b>: ${data.stats.health}</div>
      <div class="stat-item"><b>Qalxan</b>: ${data.stats.shield}</div>
      <div class="stat-item"><b>Hasar</b>: ${data.stats.damage}</div>
      <div class="stat-item"><b>S.B.H</b>: ${data.stats.sps}</div>
      <div class="stat-item"><b>Saldırı Hızı</b>: ${data.stats.attackSpeed}</div>
      <div class="stat-item"><b>Gecikmə</b>: ${data.stats.delay}</div>
      <div class="stat-item"><b>Mana</b>: ${data.stats.mana}</div>
      <div class="stat-item"><b>Say</b>: ${data.stats.number}</div>
    </div>

    <div class="stats-section" data-section-id="additional-stats">
      <div class="stat-item"><b>Menzil</b>: ${data.additionalStats.range}</div>
      <div class="stat-item"><b>Hız</b>: ${data.additionalStats.speed}</div>
      <div class="stat-item"><b>Kritik Şansı</b>: ${data.additionalStats.criticalChance}</div>
      <div class="stat-item"><b>Kritik Hasar</b>: ${data.additionalStats.criticDamage}</div>
      <div class="stat-item"><b>C.Çalma Şansı</b>: ${data.additionalStats.lifestealChance}</div>
      <div class="stat-item"><b>Can Çalma</b>: ${data.additionalStats.lifesteal}</div>
      <div class="stat-item"><b>Hasar Azaltma</b>: ${data.additionalStats.damageminimiser}</div>
      <div class="stat-item"><b>Sıyrılma Şansı</b>: ${data.additionalStats.dodge}</div>
    </div>

    <div class="stats-section" data-section-id="trait">
      <div class="trait trait-center">${data.trait}</div>
    </div>

    <div class="stats-section" data-section-id="showlevels">
      <div class="stat-item"><b>Səviyyə 1</b>: ${data.showlevels.level1}</div>
      <div class="stat-item"><b>Səviyyə 2</b>: ${data.showlevels.level2}</div>
      <div class="stat-item"><b>Səviyyə 3</b>: ${data.showlevels.level3}</div>
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

// Kartları render edən funksiya
function renderCards(cardsToRender) {
  cardsContainer.innerHTML = '';
  if (cardsToRender.length === 0) {
    cardsContainer.innerHTML = '<p>Bu endərlikdə kart tapılmadı.</p>';
    return;
  }
  cardsToRender.forEach(data => {
    cardsContainer.appendChild(createCardElement(data));
  });
}

// Məlumatları endərliyə görə çəkən və göstərən funksiya
async function fetchAndRender(rarity) {
  cardsContainer.innerHTML = '<p>Yüklənir...</p>';
  try {
    let cardsData = [];
    if (rarity === 'all') {
      const rarities = ['mundane', 'familiar', 'arcane', 'mythic', 'legendary', 'ethereal'];
      const fetchPromises = rarities.map(r => fetch(`${r}.json`).then(async res => {
        if (!res.ok) return [];
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      }));
      const results = await Promise.all(fetchPromises);
      cardsData = results.flat();
    } else {
      const response = await fetch(`${rarity}.json`);
      if (!response.ok) cardsData = [];
      else {
        const text = await response.text();
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

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const rarity = button.id.split('-')[1];
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    fetchAndRender(rarity);
  });
});

document.addEventListener('DOMContentLoaded', showMenu);
