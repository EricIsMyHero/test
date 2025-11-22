// DOM Elementləri
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');
const searchInput = document.getElementById('search-input'); 

// YENİ TEAM BUILDER ELEMENTLƏRİ
const openTeamBuilderBtn = document.getElementById('open-team-builder-btn');
const teamBuilderModal = document.getElementById('team-builder-modal');
const closeTeamBuilderBtn = document.getElementById('close-team-builder-btn');
const teamBuilderPanel = document.getElementById('team-builder-panel');
const selectedTeamCards = document.getElementById('selected-team-cards');
const totalHealth = document.getElementById('total-health');
const totalShield = document.getElementById('total-shield');
const totalDPS = document.getElementById('total-dps');
const totalMana = document.getElementById('total-mana');
const clearTeamBtn = document.getElementById('clear-team-btn');
const placeholderText = document.getElementById('placeholder-text');

// GLOBAL DƏYİŞƏNLƏR
let allCardsData = []; // Bütün yüklənmiş kartları saxlayır
let activeRarity = 'all'; // Aktiv endərliyi yadda saxlayır
let currentTeam = []; // Seçilmiş kartları (statistikalarla) saxlayır

function showMenu() {
  mainMenu.classList.remove('hidden');
  cardsSection.classList.add('hidden');
}

function showCards() {
  mainMenu.classList.add('hidden');
  cardsSection.classList.remove('hidden');
  fetchAndRender('all');
  if (searchInput) searchInput.value = '';
}

// Kart yaratmaq üçün əsas funksiya
function createCardElement(data) {
    const cardContainer = document.createElement('article');
    cardContainer.className = `card-container card r-${data.rarity.toLowerCase()}`;
    
    // TEAM BUILDER DÜYMƏSİ ƏLAVƏSİ (hidden by default)
    const addButton = document.createElement('button');
    addButton.className = 'add-to-team-btn hidden-team-btn'; // Əlavə sinif
    addButton.textContent = '+ Team';
    addButton.title = 'Komandaya Əlavə Et';
    addButton.dataset.cardName = data.name;

    addButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        addToTeam(data); 
    });
    
    cardContainer.appendChild(addButton); 
    
    // MÜQAYİSƏ DÜYMƏSİ ƏLAVƏSİ (Müqayisə funksiyasını hələlik tətbiq etmədiyiniz üçün, bunu da gizlədək)
    const compareButton = document.createElement('button');
    compareButton.className = 'add-to-compare-btn hidden-team-btn'; // Əlavə sinif
    compareButton.textContent = '+ Compare';
    compareButton.title = 'Müqayisəyə Əlavə Et';
    compareButton.dataset.cardName = data.name;

    compareButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        addToComparison(data); 
        comparisonModal.classList.remove('hidden'); // Modalı açır
    });
    
    cardContainer.appendChild(compareButton); 
    
    const setupCardListeners = (contentElement) => {
        const cardButtons = contentElement.querySelectorAll('.card-tabs button');
        cardButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const sectionId = button.dataset.section;
                
                cardButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                contentElement.querySelectorAll('.stats-section').forEach(section => {
                    section.classList.remove('visible');
                });
                
                contentElement.querySelector(`[data-section-id="${sectionId}"]`).classList.add('visible');
            });
        });
    }

    if (data.isMulti) {
        // ... (Mövcud isMulti kodu) ...
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const cardFront = createCardContent(data);
        cardFront.classList.add('card-front');
        
        const cardBack = createCardContent(data.secondForm);
        cardBack.classList.add('card-back');

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardContainer.appendChild(cardInner);

        setupCardListeners(cardFront);
        setupCardListeners(cardBack);
        
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
        
        setupCardListeners(singleCard);
    }

    if (data.rarity.toLowerCase() === 'ethereal') {
        const glowDiv = document.createElement('div');
        glowDiv.className = 'card-glow';
        glowDiv.setAttribute('aria-hidden', 'true');
        cardContainer.appendChild(glowDiv);
    }

    return cardContainer;
}

// Bu funksiya bütün kartlardakı Team/Compare düymələrinin görünməsinə nəzarət edir.
function toggleCardButtons(isVisible) {
    const buttons = document.querySelectorAll('.hidden-team-btn');
    buttons.forEach(button => {
        if (isVisible) {
            button.classList.remove('hidden-team-btn');
        } else {
            button.classList.add('hidden-team-btn');
        }
    });
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
            <button class="active" data-section="main-stats">Main</button>
            <button data-section="additional-stats">Other</button>
            <button data-section="trait">Ability</button>
            <button data-section="showlevels">Levels</button>
            <button data-section="story-section">Story</button>
        </div>
        
        <div class="card-content-area">
        
            <div class="stats-section visible" data-section-id="main-stats">
                <div class="stat-item"><b>Health <i class="fa-solid fa-heart"></i></b><span>${data.stats.health}</span></div>
                <div class="stat-item"><b>Shield <i class="fa-solid fa-shield-halved"></i></b><span>${data.stats.shield}</span></div>
                <div class="stat-item"><b>Damage <i class="fa-solid fa-hand-fist"></i></b><span>${data.stats.damage}</span></div>
                <div class="stat-item"><b>D.P.S <i class="fa-solid fa-bolt"></i></b><span>${data.stats.sps}</span></div>
                <div class="stat-item"><b>Attack Speed <i class="fa-solid fa-tachometer-alt"></i></b><span>${data.stats.attackSpeed}</span></div>
                <div class="stat-item"><b>Delay <i class="fa-solid fa-clock"></i></b><span>${data.stats.delay}</span></div>
                <div class="stat-item"><b>Mana <i class="fa-solid fa-certificate"></i></b><span>${data.stats.mana}</span></div>
                <div class="stat-item"><b>Number <i class="fa-solid fa-user"></i></b><span>${data.stats.number}</span></div>
            </div>
            
            <div class="stats-section" data-section-id="additional-stats">
                <div class="stat-item"><b>Range <i class="fa-solid fa-road"></i></b><span>${data.additionalStats.range}</span></div>
                <div class="stat-item"><b>Speed <i class="fa-solid fa-person-running"></i></b><span>${data.additionalStats.speed}</span></div>
                <div class="stat-item"><b>Critic Chance <i class="fa-solid fa-percent"></i></b><span>${data.additionalStats.criticalChance}</span></div>
                <div class="stat-item"><b>Critical Damage <i class="fa-solid fa-crosshairs"></i></b><span>${data.additionalStats.criticDamage}</span></div>
                <div class="stat-item"><b>Life Steal Chance <i class="fa-solid fa-percent "></i></b><span>${data.additionalStats.lifestealChance}</span></div>
                <div class="stat-item"><b>Life Steal <i class="fa-solid fa-skull-crossbones "></i></b><span>${data.additionalStats.lifesteal}</span></div>
                <div class="stat-item"><b>Damage Reduction <i class="fa-solid fa-helmet-un "></i></b><span>${data.additionalStats.damageminimiser}</span></div>
                <div class="stat-item"><b>Dodge Chance <i class="fa-solid fa-wind "></i></b><span>${data.additionalStats.dodge}</span></div>
            </div>
            
            <div class="stats-section" data-section-id="trait">
                <div class="trait trait-center">${data.trait}</div>
            </div>

            <div class="stats-section" data-section-id="showlevels">
                <div class="stat-item"><b>Level 1</b><span>${data.showlevels.level1}</span></div>
                <div class="stat-item"><b>Level 2</b><span>${data.showlevels.level2}</span></div>
                <div class="stat-item"><b>Level 3</b><span>${data.showlevels.level3}</span></div>
            </div>
            
            <div class="stats-section" data-section-id="story-section">
                <div class="story-content">${data.story}</div>
            </div>

        </div> `;

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

function getNumericStat(statValue) {
    // String qiymətləri rəqəmə çevirir və 'x' kimi simvolları təmizləyir.
    // Dəyərlər JSON fayllarınızda string kimi saxlanıldığı üçün vacibdir.
    if (typeof statValue === 'string') {
        const cleanedValue = statValue.replace(/[^\d.]/g, ''); // Rəqəm və nöqtədən başqa hər şeyi təmizlə
        return parseInt(cleanedValue) || 0;
    }
    return statValue || 0;
}

function addToTeam(cardData) {
    if (currentTeam.length >= 6) {
        alert('Komandada maksimum 6 kart ola bilər.');
        return;
    }
    
    // Kartdan lazım olan əsas statistikaları çıxarın və rəqəmə çevirin
    const cardToAdd = {
        name: cardData.name,
        health: getNumericStat(cardData.stats.health),
        shield: getNumericStat(cardData.stats.shield),
        sps: getNumericStat(cardData.stats.sps),
        // Mana üçün xüsusi yoxlama: JSON faylınızda mana stringdir.
        mana: getNumericStat(cardData.stats.mana), 
        originalCardData: cardData 
    };

    currentTeam.push(cardToAdd);
    
    updateTeamPanel();
    updateTeamStats();
}

function removeFromTeam(cardName) {
    // Sadece adı ilə yoxlayın və birinci tapdığınız kartı silin (ehtimal ki, təkrar ad yoxdur)
    const index = currentTeam.findIndex(card => card.name === cardName);
    if (index > -1) {
        currentTeam.splice(index, 1);
    }
    
    updateTeamPanel();
    updateTeamStats();
}

function updateTeamPanel() {
    selectedTeamCards.innerHTML = '';
    
    if (currentTeam.length === 0) {
        placeholderText.style.display = 'block';
        selectedTeamCards.appendChild(placeholderText);
        return;
    }
    placeholderText.style.display = 'none';

    currentTeam.forEach(card => {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-card-item';
        teamItem.innerHTML = `
            <span>${card.name}</span>
            <button class="remove-from-team-btn" data-card-name="${card.name}">X</button>
        `;
        selectedTeamCards.appendChild(teamItem);
    });

    // Silmə düymələrinə listenerlər əlavə edin
    selectedTeamCards.querySelectorAll('.remove-from-team-btn').forEach(button => {
        button.addEventListener('click', () => {
            const cardName = button.dataset.cardName;
            removeFromTeam(cardName);
        });
    });
}

function updateTeamStats() {
    const stats = currentTeam.reduce((acc, card) => {
        acc.health += card.health;
        acc.shield += card.shield;
        acc.damage += card.damage;
        acc.dps += card.sps;
        acc.mana += card.mana; 
        return acc;
    }, { health: 0, shield: 0, damage: 0, dps: 0, mana: 0 });

    totalHealth.textContent = stats.health;
    totalShield.textContent = stats.shield;
    totalDamage.textContent = stats.damage;
    totalDPS.textContent = stats.dps;
    totalMana.textContent = stats.mana;

    // YENİ: Düymənin üzərindəki mətni yeniləyin
    if (openTeamBuilderBtn) {
        openTeamBuilderBtn.textContent = `Komandanı Göstər (${currentTeam.length}/6)`;
    }
}

// Komandanı Təmizlə funksiyası üçün listener
clearTeamBtn.addEventListener('click', () => {
    currentTeam = [];
    updateTeamPanel();
    updateTeamStats();
});

// YENİ ƏSAS FİLTR VƏ AXTARIŞ FUNKSİYASI
function filterAndRender() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Bütün kartlardan başlayın
    let filteredCards = allCardsData;

    // 1. Endərliyə görə filtrləmə (Əgər 'all' deyilsə)
    if (activeRarity !== 'all') {
        filteredCards = filteredCards.filter(card => card.rarity.toLowerCase() === activeRarity);
    }

    // 2. Axtarış termininə görə filtrləmə
    if (searchTerm.length > 0) {
        filteredCards = filteredCards.filter(card => 
            card.name.toLowerCase().includes(searchTerm)
        );
    }

    renderCards(filteredCards);
}


// Məlumatları çəkən funksiya (Əhəmiyyətli dərəcədə DƏYİŞİR)
async function fetchAndRender(rarity) {
  cardsContainer.innerHTML = '<p>Məlumatlar yüklənir...</p>';
  activeRarity = rarity; 
  try {
    
    // 'all' kartları çəkmək lazımdırsa VƏ hələ çəkilməyibsə:
    if (allCardsData.length === 0) {
      const rarities = ['mundane', 'familiar', 'arcane', 'mythic', 'legendary', 'ethereal'];
      const fetchPromises = rarities.map(r =>
        fetch(`${r}.json`).then(async res => {
          if (!res.ok) {
            if (res.status === 404) {
              console.warn(`${r}.json tapılmadı, bu endərlik ötürülür.`);
              return [];
            }
            throw new Error(`${r}.json yüklənmədi`);
          }
          const text = await res.text();
          return text ? JSON.parse(text) : [];
        })
      );
      const results = await Promise.all(fetchPromises);
      allCardsData = results.flat(); // Bütün kartları bir dəfə çəkib saxlayırıq
    }
    
    // Məlumatı çəkdikdən sonra filtrləmə və render etməyi icra edin
    filterAndRender();
    
  } catch (error) {
    console.error('Məlumatları yükləmə zamanı xəta:', error);
    cardsContainer.innerHTML = '<p style="color:red;">Kart məlumatları yüklənərkən xəta baş verdi.</p>';
  }
}


// EVENT LİSTENERLƏRİ

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
    modal.textContent="Coming Soon...";
    document.body.appendChild(modal);
    setTimeout(()=>{document.body.removeChild(modal);},3000);
  });
});

// FİLTR DÜYMƏLƏRİ (DƏYİŞİR)
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const rarity = button.id.split('-')[1];
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Active rarity yenilənir və filtrasiya təkrar icra olunur
    activeRarity = rarity; 
    filterAndRender(); 
  });
});

// TEAM BUILDER MODAL EVENT LİSTENERLƏRİ
if (openTeamBuilderBtn) {
    openTeamBuilderBtn.addEventListener('click', () => {
        teamBuilderModal.classList.remove('hidden');
        updateTeamPanel();
        toggleCardButtons(true); // Modalı açanda düymələri göstər
    });
}

if (closeTeamBuilderBtn) {
    closeTeamBuilderBtn.addEventListener('click', () => {
        teamBuilderModal.classList.add('hidden');
        toggleCardButtons(false); // Modalı bağlayanda düymələri gizlət
    });
}

// ... (Mövcud DOMContentLoaded listenerini yeniləyin) ...
document.addEventListener('DOMContentLoaded', () => {
    showMenu();
    updateTeamStats(); // Başlanğıcda sıfır göstərsin və düyməni yeniləsin
    updateTeamPanel(); // Placeholder-i göstərsin
    // updateComparisonView(); // Bu funksiya hələlik yoxdur
});

// AXTARIŞ GİRİŞİNƏ EVENT LİSTENER ƏLAVƏ EDİN
if (searchInput) {
    searchInput.addEventListener('input', filterAndRender);
} else {
    // Əgər axtarış inputu tapılmayıbsa, xəbərdarlıq verin
    console.warn("Axtarış inputu (id='search-input') tapılmadı. HTML-i yoxlayın.");
}

document.addEventListener('DOMContentLoaded', showMenu);
