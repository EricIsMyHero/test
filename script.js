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
    
    // Kartın əsas məzmunu
    const cardContent = createCardContent(data);

    // Düymələr üçün yeni konteyner
    const cardButtons = document.createElement('div');
    cardButtons.className = 'card-buttons';

    // Düymələri yaratmaq
    const mainStatsBtn = document.createElement('button');
    mainStatsBtn.className = 'card-button active';
    mainStatsBtn.textContent = 'Əsas';
    mainStatsBtn.setAttribute('data-target', 'main-stats');

    const additionalStatsBtn = document.createElement('button');
    additionalStatsBtn.className = 'card-button';
    additionalStatsBtn.textContent = 'Əlavə';
    additionalStatsBtn.setAttribute('data-target', 'additional-stats');

    const showLevelsBtn = document.createElement('button');
    showLevelsBtn.className = 'card-button';
    showLevelsBtn.textContent = 'Səviyyələr';
    showLevelsBtn.setAttribute('data-target', 'showlevels');

    // Düymələri konteynerə əlavə etmək
    cardButtons.appendChild(mainStatsBtn);
    cardButtons.appendChild(additionalStatsBtn);
    cardButtons.appendChild(showLevelsBtn);

    // Kartın məzmununu və düymələri əsas konteynerə əlavə etmək
    cardContainer.appendChild(cardContent);
    cardContainer.appendChild(cardButtons);

    // Düymələrə hadisə dinləyiciləri əlavə etmək
    const statViews = cardContent.querySelectorAll('.stats-view');
    cardButtons.querySelectorAll('.card-button').forEach(button => {
        button.addEventListener('click', () => {
            // Bütün düymələrdən aktiv sinifi silmək
            cardButtons.querySelectorAll('.card-button').forEach(btn => btn.classList.remove('active'));
            // Kliklənən düyməyə aktiv sinifini əlavə etmək
            button.classList.add('active');

            // Bütün statistika görünüşlərini gizlətmək
            statViews.forEach(view => view.classList.remove('active'));
            // Hədəf statistika görünüşünü göstərmək
            const target = button.getAttribute('data-target');
            cardContent.querySelector(`[data-view="${target}"]`).classList.add('active');
        });
    });

    return cardContainer;
}

// Kartın içindəki məlumatları yaratmaq üçün köməkçi funksiya
function createCardContent(data) {
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    // Kartın üst hissəsi
    const cardHeader = document.createElement('header');
    cardHeader.innerHTML = `<span class="name">${data.name}</span> <span class="rarity">${data.rarity}</span>`;

    // Əsas statistikalar görünüşü
    const mainStatsView = document.createElement('div');
    mainStatsView.className = 'stats-view active';
    mainStatsView.setAttribute('data-view', 'main-stats');
    let mainStatsHtml = ``;
    for (const stat in data.stats) {
        mainStatsHtml += `
            <div class="stat-row">
                <span class="stat-name">${stat}</span>
                <span class="stat-value">${data.stats[stat]}</span>
            </div>
        `;
    }
    mainStatsView.innerHTML = mainStatsHtml;

    // Əlavə statistikalar görünüşü
    const additionalStatsView = document.createElement('div');
    additionalStatsView.className = 'stats-view';
    additionalStatsView.setAttribute('data-view', 'additional-stats');
    let additionalStatsHtml = ``;
    for (const stat in data.additionalStats) {
        additionalStatsHtml += `
            <div class="stat-row">
                <span class="stat-name">${stat}</span>
                <span class="stat-value">${data.additionalStats[stat]}</span>
            </div>
        `;
    }
    additionalStatsView.innerHTML = additionalStatsHtml;

    // Səviyyələr görünüşü
    const showLevelsView = document.createElement('div');
    showLevelsView.className = 'stats-view';
    showLevelsView.setAttribute('data-view', 'showlevels');
    let levelsHtml = ``;
    for (const level in data.showlevels) {
        levelsHtml += `
            <div class="level-row">
                <span class="level-name">${level}</span>
                <span class="level-value">${data.showlevels[level]}</span>
            </div>
        `;
    }
    showLevelsView.innerHTML = levelsHtml;

    cardContent.appendChild(cardHeader);
    cardContent.appendChild(mainStatsView);
    cardContent.appendChild(additionalStatsView);
    cardContent.appendChild(showLevelsView);

    return cardContent;
}


// Kartları render edən funksiya
function renderCards(data) {
    cardsContainer.innerHTML = '';
    data.forEach(card => {
        cardsContainer.appendChild(createCardElement(card));
    });
}

function createMultiCardElement(data) {
    const cardContainer = document.createElement('article');
    cardContainer.className = `card-container card r-${data.rarity.toLowerCase()}`;
    
    // Düymələr üçün yeni konteyner
    const cardButtons = document.createElement('div');
    cardButtons.className = 'card-buttons';

    const flipButton = document.createElement('button');
    flipButton.className = 'card-button flip-button';
    flipButton.textContent = 'Arxa Üz';

    const mainStatsBtn = document.createElement('button');
    mainStatsBtn.className = 'card-button active';
    mainStatsBtn.textContent = 'Əsas';
    mainStatsBtn.setAttribute('data-target', 'main-stats');

    const additionalStatsBtn = document.createElement('button');
    additionalStatsBtn.className = 'card-button';
    additionalStatsBtn.textContent = 'Əlavə';
    additionalStatsBtn.setAttribute('data-target', 'additional-stats');

    const showLevelsBtn = document.createElement('button');
    showLevelsBtn.className = 'card-button';
    showLevelsBtn.textContent = 'Səviyyələr';
    showLevelsBtn.setAttribute('data-target', 'showlevels');

    cardButtons.appendChild(mainStatsBtn);
    cardButtons.appendChild(additionalStatsBtn);
    cardButtons.appendChild(showLevelsBtn);
    cardButtons.appendChild(flipButton);

    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    const cardFront = createCardContent(data);
    cardFront.classList.add('card-front');
    
    const cardBack = createCardContent(data.secondForm);
    cardBack.classList.add('card-back');

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    cardContainer.appendChild(cardInner);
    cardContainer.appendChild(cardButtons);

    cardContainer.addEventListener('click', (e) => {
        // Klik düymə deyil, kartın özüdürsə
        if (e.target.tagName.toLowerCase() !== 'button') {
            cardContainer.classList.toggle('is-flipped');
        }
    });

    flipButton.addEventListener('click', () => {
        cardContainer.classList.toggle('is-flipped');
    });

    // Add event listeners for new buttons
    const statViews = cardFront.querySelectorAll('.stats-view');
    const backStatViews = cardBack.querySelectorAll('.stats-view');

    cardButtons.querySelectorAll('.card-button').forEach(button => {
        button.addEventListener('click', (e) => {
            // Flip buttona klikləyəndə heç bir şey etmə
            if (e.target.classList.contains('flip-button')) {
                return;
            }
            // Remove active class from all buttons
            cardButtons.querySelectorAll('.card-button').forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            button.classList.add('active');

            // Hide all stat views on both sides
            statViews.forEach(view => view.classList.remove('active'));
            backStatViews.forEach(view => view.classList.remove('active'));

            // Show the target stat view
            const target = button.getAttribute('data-target');
            cardFront.querySelector(`[data-view="${target}"]`).classList.add('active');
            cardBack.querySelector(`[data-view="${target}"]`).classList.add('active');
        });
    });

    return cardContainer;
}

// Kartları render edən funksiya
function renderCards(data) {
  cardsContainer.innerHTML = '';
  data.forEach(card => {
      if (card.isMulti) {
        cardsContainer.appendChild(createMultiCardElement(card));
      } else {
        cardsContainer.appendChild(createCardElement(card));
      }
  });
}

function fetchAndRender(rarity) {
  let endpoint = '';
  switch (rarity) {
    case 'all':
      endpoint = 'all';
      break;
    default:
      endpoint = `${rarity}.json`;
      break;
  }
  
  loadCards(endpoint);
}

// Düymələrə hadisə dinləyiciləri
async function loadCards(endpoint) {
  try {
    let cardsData = [];
    if (endpoint === 'all') {
      const rarities = ['mundane', 'familiar', 'arcane', 'mythic', 'legendary', 'ethereal'];
      for (const rarity of rarities) {
        const response = await fetch(`${rarity}.json`);
        if (response.ok) {
          const data = await response.json();
          cardsData = cardsData.concat(data);
        } else {
          console.error(`Error loading ${rarity}.json: ${response.status}`);
        }
      }
    } else {
      const response = await fetch(endpoint);
      if (response.ok) {
        cardsData = await response.json();
      } else {
        console.error(`Error loading ${endpoint}: ${response.status}`);
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

['show-spells-btn','show-boosters-btn','show-towers-btn'].forEach(id=>{
  document.getElementById(id).addEventListener('click',()=>{\n    const modal=document.createElement('div');\n    modal.style.position='fixed';\n    modal.style.top='50%';\n    modal.style.left='50%';\n    modal.style.transform='translate(-50%, -50%)';\n    modal.style.padding='20px';\n    modal.style.backgroundColor='var(--card)';\n    modal.style.color='var(--text)';\n    modal.style.borderRadius='12px';\n    modal.style.boxShadow='var(--shadow)';\n    modal.style.zIndex='1000';\n    modal.textContent="Bu bölmə hələ hazır deyil.";\n    document.body.appendChild(modal);\n    setTimeout(()=>{document.body.removeChild(modal);},3000);\n  });
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const rarity = button.id.replace('filter-', '');
    fetchAndRender(rarity);
  });
});
