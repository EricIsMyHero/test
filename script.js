// DOM Elementləris
const mainMenu = document.getElementById('main-menu');
const cardsSection = document.getElementById('cards-section');
const showCardsBtn = document.getElementById('show-cards-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');
const sidebarCardName = document.getElementById('sidebar-card-name');
const sidebarCardType = document.getElementById('sidebar-card-type');
const sidebarStatsContent = document.getElementById('sidebar-stats-content');
const sidebarButtons = document.querySelectorAll('.sidebar-buttons button');

// Menyuya qayıtmaq üçün funksiya
function showMenu() {
    mainMenu.classList.remove('hidden');
    cardsSection.classList.add('hidden');
}

// Kartlar səhifəsini göstərmək üçün funksiya
function showCards() {
    mainMenu.classList.add('hidden');
    cardsSection.classList.remove('hidden');
    fetchAndRender('all');
}

// Məlumatları endərliyə görə çəkən və göstərən funksiya
async function fetchAndRender(rarity) {
    cardsContainer.innerHTML = '<p>Yüklənir...</p>';
    try {
        let cardsData = [];
        if (rarity === 'all') {
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
            cardsData = results.flat();
        } else {
            const response = await fetch(`${rarity}.json`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`${rarity}.json tapılmadı.`);
                    cardsData = [];
                } else {
                    throw new Error(`HTTP xətası! Status: ${response.status}`);
                }
            } else {
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

// Kart seçildikdə yan menyunu yeniləyən funksiya
function selectCard(data) {
    sidebarCardName.textContent = data.name;
    sidebarCardType.textContent = data.isHybrid ? `${data.type[0]}/${data.type[1]}` : data.type[0];
    updateSidebarStats(data);
}

// Yan menyunun statistikalarını yeniləyən funksiya
function updateSidebarStats(data) {
    sidebarStatsContent.innerHTML = '';
    
    // Bütün statistikalar hissələrini bir massivdə saxlayırıq
    const statsSections = [
        { id: 'main-stats', data: data.stats, isGrid: true },
        { id: 'additional-stats', data: data.additionalStats, isGrid: true },
        { id: 'trait', data: data.trait, isGrid: false },
        { id: 'showlevels', data: data.showlevels, isGrid: false },
        { id: 'role', data: data.role, isGrid: false },
        { id: 'story', data: data.story, isGrid: false }
    ];

    // Hər hissə üçün element yaradıb DOM-a əlavə edirik
    statsSections.forEach(section => {
        const newSection = createStatsSection(section.id, section.data, section.isGrid);
        sidebarStatsContent.appendChild(newSection);
    });

    // Əsas statistikalar hissəsini avtomatik görünən edirik
    sidebarStatsContent.querySelector(`[data-section-id="main-stats"]`).classList.add('visible');

    // Bütün yan menyu düymələrinin aktivliyini sıfırlayırıq
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.sidebar-buttons button[data-section="main-stats"]').classList.add('active');

    // Yan menyu düymələrinə klik hadisəsi əlavə edirik
    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.dataset.section;
            if (sectionId) {
                sidebarButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                sidebarStatsContent.querySelectorAll('.stats-section').forEach(section => {
                    section.classList.remove('visible');
                });
                sidebarStatsContent.querySelector(`[data-section-id="${sectionId}"]`).classList.add('visible');
            }
        });
    });
}

// Statistikalar hissəsini yaradan köməkçi funksiya
function createStatsSection(sectionId, data, isGrid) {
    const section = document.createElement('div');
    section.className = 'stats-section';
    section.setAttribute('data-section-id', sectionId);

    // Məlumat stringdirsə, sadəcə mətn kimi əlavə edirik
    if (typeof data === 'string') {
        const p = document.createElement('p');
        p.className = 'text-content';
        p.textContent = data;
        section.appendChild(p);
    } else if (isGrid) {
        // Məlumat grid şəklindədirsə
        for (const key in data) {
            const item = document.createElement('div');
            item.className = 'stat-item';
            item.innerHTML = `<b>${key.charAt(0).toUpperCase() + key.slice(1)}</b><span>${data[key]}</span>`;
            section.appendChild(item);
        }
    } else {
        // Məlumat adi siyahı şəklindədirsə
        for (const key in data) {
            const item = document.createElement('div');
            item.className = 'stat-item';
            item.innerHTML = `<b>${key.charAt(0).toUpperCase() + key.slice(1)}</b><span>${data[key]}</span>`;
            section.appendChild(item);
        }
    }
    return section;
}

// Kart elementini yaradan funksiya
function createCardElement(data) {
    const cardContainer = document.createElement('article');
    cardContainer.className = `card-container card-single r-${data.rarity.toLowerCase()}`;
    
    // Kart üzərinə kliklədikdə yan menyunu yenilə
    cardContainer.addEventListener('click', () => {
        selectCard(data);
    });

    const content = document.createElement('div');
    const badgeText = data.isHybrid ? `${data.type[0]}/${data.type[1]}` : data.type[0];
    content.innerHTML = `
        <div class="stripe"></div>
        <div class="head">
            <div class="name">${data.name}</div>
            <span class="badge">${badgeText}</span>
        </div>
    `;
    cardContainer.appendChild(content);
    return cardContainer;
}

// Kartları səhifədə render edən funksiya
function renderCards(cardsToRender) {
    cardsContainer.innerHTML = '';
    if (cardsToRender.length === 0) {
        cardsContainer.innerHTML = '<p>Kart tapılmadı.</p>';
        return;
    }
    cardsToRender.forEach(data => {
        cardsContainer.appendChild(createCardElement(data));
    });

    if (cardsToRender.length > 0) {
        selectCard(cardsToRender[0]);
    }
}

// Səhifə yükləndikdə menyunu göstər
document.addEventListener('DOMContentLoaded', showMenu);
// Düymələrə hadisə dinləyiciləri əlavə et
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
