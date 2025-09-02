// DOM Elementləri
const filterButtons = document.querySelectorAll('.controls button');
const cardsContainer = document.getElementById('cards');

// Kart yaratmaq üçün əsas funksiya
function createCardElement(data) {
    const cardContainer = document.createElement('article');
    cardContainer.className = `card-container card r-${data.rarity.toLowerCase()}`;
    
    // Resim ve detay butonu ekleme
    const imageAndInfoSection = document.createElement('div');
    imageAndInfoSection.className = 'card-image-section';
    imageAndInfoSection.innerHTML = `
        <img src="${data.image}" alt="${data.name}" class="card-image">
        <button class="info-button" data-info-id="${data.name}">Ətraflı</button>
    `;
    cardContainer.appendChild(imageAndInfoSection);

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
            } else if (e.target.closest('.info-button')) {
                // Bilgi butonu tıklandığında modali aç
                showMoreInfoModal(data);
            }
        });

        cardContainer.appendChild(flipButton);
    } else {
        const singleCard = createCardContent(data);
        singleCard.classList.add('card-single');
        cardContainer.appendChild(singleCard);
        
        // Tek kart için bilgi butonu olayını ayarla
        const infoButton = cardContainer.querySelector('.info-button');
        if (infoButton) {
            infoButton.addEventListener('click', () => {
                showMoreInfoModal(data);
            });
        }
    }

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
            <div class="name">${data.name}</div><span class="badge">${badgeText}</span>
        </div>
        <div class="card-tabs">
            <button class="active" data-section="main-stats">Əsas</button>
            <button data-section="additional-stats">Əlavə</button>
            <button data-section="trait">Özəllik</button>
        </div>
        
        <div class="stats-section visible" data-section-id="main-stats">
            <div class="stat-item"><b>Can <i class="fa-solid fa-heart"></i></b><span>${data.stats.health}</span></div>
            <div class="stat-item"><b>Qalxan <i class="fa-solid fa-shield-halved"></i></b><span>${data.stats.shield}</span></div>
            <div class="stat-item"><b>Hasar <i class="fa-solid fa-hammer"></i></b><span>${data.stats.damage}</span></div>
            <div class="stat-item"><b>S.B.H <i class="fa-solid fa-bolt"></i></b><span>${data.stats.sps}</span></div>
            <div class="stat-item"><b>Saldırı Hızı <i class="fa-solid fa-tachometer-alt"></i></b><span>${data.stats.attackSpeed}</span></div>
            <div class="stat-item"><b>Gecikmə <i class="fa-solid fa-clock"></i></b><span>${data.stats.delay}</span></div>
            <div class="stat-item"><b>Mana <i class="fa-solid fa-certificate"></i></b><span>${data.stats.mana}</span></div>
            <div class="stat-item"><b>Say <i class="fa-solid fa-user"></i></b><span>${data.stats.number}</span></div>
        </div>
        
        <div class="stats-section" data-section-id="additional-stats">
            <div class="stat-item"><b>Menzil <i class="fa-solid fa-road"></i></b><span>${data.additionalStats.range}</span></div>
            <div class="stat-item"><b>Hız <i class="fa-solid fa-person-running"></i></b><span>${data.additionalStats.speed}</span></div>
            <div class="stat-item"><b>Kritik Şansı <i class="fa-solid fa-crosshairs"></i></b><span>${data.additionalStats.criticalChance}</span></div>
            <div class="stat-item"><b>C.Çalma Şansı <i class="fa-solid fa-skull "></i></b><span>${data.additionalStats.lifestealChance}</span></div>
        </div>
        
        <div class="stats-section" data-section-id="trait">
            <div class="trait trait-center">${data.trait}</div>
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

// Detay penceresini yaradan funksiya
function showMoreInfoModal(data) {
    // Önceki modalı kapat
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Modal HTML'i oluştur
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-header">
                    <h2>${data.name}</h2>
                    <span class="badge">${data.isHybrid ? `${data.type[0]}/${data.type[1]}` : data.type[0]}</span>
                </div>
                <img src="${data.image}" alt="${data.name}" class="modal-image">
                <div class="modal-body">
                    <p><b>Rarity:</b> ${data.rarity}</p>
                    <p><b>Story:</b> ${data.story}</p>
                    <hr>
                    <h3>Əsas Stats</h3>
                    <p><b>Can:</b> ${data.stats.health}</p>
                    <p><b>Qalxan:</b> ${data.stats.shield}</p>
                    <p><b>Hasar:</b> ${data.stats.damage}</p>
                    <p><b>S.B.H:</b> ${data.stats.sps}</p>
                    <p><b>Saldırı Hızı:</b> ${data.stats.attackSpeed}</p>
                    <p><b>Gecikmə:</b> ${data.stats.delay}</p>
                    <p><b>Mana:</b> ${data.stats.mana}</p>
                    <p><b>Say:</b> ${data.stats.number}</p>
                    <hr>
                    <h3>Əlavə Stats</h3>
                    <p><b>Menzil:</b> ${data.additionalStats.range}</p>
                    <p><b>Hız:</b> ${data.additionalStats.speed}</p>
                    <p><b>Kritik Şansı:</b> ${data.additionalStats.criticalChance}</p>
                    <p><b>Can Çalma Şansı:</b> ${data.additionalStats.lifestealChance}</p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Kapatma olayını ayarla
    document.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
            document.querySelector('.modal-overlay').remove();
        }
    });
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

// Event Listeners
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const rarity = button.id.split('-')[1];
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        fetchAndRender(rarity);
    });
});

// Səhifə yüklənərkən bütün kartları çək və göstər
document.addEventListener('DOMContentLoaded', () => fetchAndRender('all'));
