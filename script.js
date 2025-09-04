// DOM Elementləri
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const cardsContainer = document.getElementById('cards');
const filterButtons = document.querySelectorAll('.filterBtn');
const loadingSpinner = document.getElementById('loading-spinner');

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

    // Modal pəncərə üçün klik
    cardContainer.addEventListener('dblclick', () => showCardModal(data));

    return cardContainer;
}

// Kartın iç məzmununu yaradan köməkçi funksiya
function createCardContent(data) {
    const content = document.createElement('div');
    const badgeText = data.isHybrid ? `${data.type[0]}/${data.type[1]}` : data.type[0];
    content.innerHTML = `
        <div class="stripe"></div>
        <div class="head">
            <div class="name">${data.name}</div><span class="badge">${badgeText}</span>
        </div>
        <div class="card-tabs">
            <button class="active" data-section="main-stats">Əsas</button>
            <button data-section="additional-stats">Əlavə</button>
            <button data-section="trait">Özəllik</button>
            <button data-section="showlevels">Səviyyələr</button>
        </div>
        
        <div class="stats-section visible" data-section-id="main-stats">
            <div class="stat-item"><b>Can</b><span>${data.stats.health}</span></div>
            <div class="stat-item"><b>Qalxan</b><span>${data.stats.shield}</span></div>
            <div class="stat-item"><b>Hasar</b><span>${data.stats.damage}</span></div>
            <div class="stat-item"><b>S.B.H</b><span>${data.stats.sps}</span></div>
            <div class="stat-item"><b>Saldırı Hızı</b><span>${data.stats.attackSpeed}</span></div>
            <div class="stat-item"><b>Gecikmə</b><span>${data.stats.delay}</span></div>
            <div class="stat-item"><b>Mana</b><span>${data.stats.mana}</span></div>
            <div class="stat-item"><b>Say</b><span>${data.stats.number}</span></div>
        </div>
        
        <div class="stats-section" data-section-id="additional-stats">
            <div class="stat-item"><b>Menzil</b><span>${data.additionalStats.range}</span></div>
            <div class="stat-item"><b>Hız</b><span>${data.additionalStats.speed}</span></div>
            <div class="stat-item"><b>Kritik Şansı</b><span>${data.additionalStats.criticalChance}</span></div>
            <div class="stat-item"><b>Kritik Hasar</b><span>${data.additionalStats.criticDamage}</span></div>
            <div class="stat-item"><b>C.Çalma Şansı</b><span>${data.additionalStats.lifestealChance}</span></div>
            <div class="stat-item"><b>Can Çalma</b><span>${data.additionalStats.lifesteal}</span></div>
            <div class="stat-item"><b>Hasar Azaltma</b><span>${data.additionalStats.damageminimiser}</span></div>
            <div class="stat-item"><b>Sıyrılma Şansı</b><span>${data.additionalStats.dodge}</span></div>
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

            content.querySelectorAll('.stats-section').forEach(section => section.classList.remove('visible'));
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

// Kart detallarını modal pəncərədə göstərmək
function showCardModal(data) {
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
    modal.style.maxWidth = '90%';
    modal.style.maxHeight = '80%';
    modal.style.overflowY = 'auto';
    modal.innerHTML = `
        <h2>${data.name}</h2>
        <p><b>Tip:</b> ${data.type.join ? data.type.join('/') : data.type}</p>
        <p><b>Can:</b> ${data.stats.health}, <b>Qalxan:</b> ${data.stats.shield}</p>
        <p><b>Hasar:</b> ${data.stats.damage}</p>
        <button id="closeModalBtn">Bağla</button>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeModalBtn').addEventListener('click', () => document.body.removeChild(modal));
}

// Məlumatları endərliyə görə çəkən və göstərən funksiya
async function fetchAndRender(rarity) {
    loadingSpinner.classList.remove('hidden');
    cardsContainer.innerHTML = '';
    try {
        let cardsData = [];
        if (rarity === 'all') {
            const rarities = ['mundane', 'familiar', 'arcane', 'mythic', 'legendary', 'ethereal'];
            const fetchPromises = rarities.map(r =>
                fetch(`${r}.json`).then(async res => {
                    if (!res.ok) return [];
                    const text = await res.text();
                    return text ? JSON.parse(text) : [];
                })
            );
            const results = await Promise.all(fetchPromises);
            cardsData = results.flat();
        } else {
            const response = await fetch(`${rarity}.json`);
            const text = await response.text();
            cardsData = text ? JSON.parse(text) : [];
        }
        renderCards(cardsData);
    } catch (error) {
        console.error('Məlumatları yükləmə zamanı xəta:', error);
        cardsContainer.innerHTML = '<p style="color:red;">Kart məlumatları yüklənərkən xəta baş verdi.</p>';
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Filter düymələri
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const rarity = button.dataset.rarity;
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    fetchAndRender(rarity);
  });
});

// Event-lər
showCardsBtn.addEventListener('click', showCards);
backToMenuBtn.addEventListener('click', showMenu);

document.addEventListener('DOMContentLoaded', showMenu);
