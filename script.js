const CAT_NAMES = [
  'Мурчальчик', 'Пушистик', 'Барсик', 'Мяуриций', 'Котофей',
  'Снежок', 'Рыжик', 'Василий', 'Клёпа', 'Тишка',
  'Симба', 'Граф', 'Шерлок', 'Гром', 'Валькирия',
  'Маркиз', 'Феликс', 'Луна', 'Зефир', 'Принц',
  'Облачко', 'Персик', 'Мармелад', 'Карамель', 'Наполеон'
];

const CAT_DESCRIPTIONS = [
  'Ленивый кот', 'Мурчит по поводу', 'Повелитель дивана',
  'Охотник за лазерной точкой', 'Мастер маскировки',
  'Покоритель коробок', 'Ниндзя задних лапок',
  'Легенда подоконника', 'Тихий, но опасный',
  'Зовёт на кухню', 'Спит 23 часа в сутки',
  'Страж пустой миски', 'Мяу-мастер',
  'Не дождёшься корма', 'Пушистый тиран',
  'Крадётся как тень', 'Покоритель шерстяных носков',
  'Босс кормушки', 'Хвост как антенна',
  'Мурчит и точит когти'
];

const FUR_COLORS = [
  { body: '#F4A460', name: 'оранжевый' },
  { body: '#808080', name: 'серый' },
  { body: '#2C2C2C', name: 'чёрный' },
  { body: '#FAFAFA', name: 'белый' },
  { body: '#D2691E', name: 'рыжий' },
  { body: '#8B6914', name: 'коричневый' },
  { body: '#FFE4B5', name: 'кремовый' },
  { body: '#A0522D', name: 'сил-пойнт' },
  { body: '#C0C0C0', name: 'полосатый' },
  { body: '#DEB887', name: 'пятнистый' }
];

const EYE_STYLES = [
  { color: '#4CAF50', name: 'зелёные' },
  { color: '#00BCD4', name: 'голубые' },
  { color: '#FFC107', name: 'жёлтые' },
  { color: '#E91E63', name: 'розовые' },
  { color: '#9C27B0', name: 'фиолетовые' }
];

const OUTFITS = [
  { id: 'none', name: 'без одежды' },
  { id: 'sweater', name: 'свитер' },
  { id: 'jacket', name: 'куртка' },
  { id: 'cloak', name: 'плащ' }
];

const HATS = [
  { id: 'none', name: 'без шапки' },
  { id: 'tophat', name: 'цилиндр' },
  { id: 'crown', name: 'корона' },
  { id: 'beret', name: 'берет' },
  { id: 'wizard', name: 'шляпа волшебника' }
];

const ACCESSORIES = [
  { id: 'none', name: 'без аксессуара' },
  { id: 'glasses', name: 'очки' },
  { id: 'scarf', name: 'шарф' },
  { id: 'bowtie', name: 'бабочка' },
  { id: 'headphones', name: 'наушники' }
];

const RARITIES = [
  { id: 'common', color: '#9D9D9D', glow: 'none', probability: 0.70 },
  { id: 'rare', color: '#0070FF', glow: '0 0 15px rgba(0,112,255,0.4)', probability: 0.20 },
  { id: 'epic', color: '#A335EE', glow: '0 0 20px rgba(163,53,238,0.4)', probability: 0.08 },
  { id: 'legendary', color: '#FF8000', glow: '0 0 25px rgba(255,128,0,0.5)', probability: 0.02 }
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRarity() {
  const r = Math.random();
  let cumulative = 0;
  for (const rarity of RARITIES) {
    cumulative += rarity.probability;
    if (r <= cumulative) return rarity;
  }
  return RARITIES[0];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCatSVG(cat) {
  const fur = cat.furColor;
  const eyes = cat.eyeStyle;
  const innerEar = '#FFB6C1';
  const nose = '#FF8C8C';
  const whiskerColor = '#555';
  const isStriped = fur.name === 'полосатый';
  const isSpotted = fur.name === 'пятнистый';
  const isSealPoint = fur.name === 'сил-пойнт';
  const isBlack = fur.name === 'чёрный';
  const isWhite = fur.name === 'белый';

  let stripes = '';
  if (isStriped) {
    stripes = `
      <line x1="60" y1="42" x2="68" y2="52" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="70" y1="40" x2="76" y2="50" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="80" y1="42" x2="74" y2="52" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="120" y1="42" x2="124" y2="52" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="130" y1="40" x2="126" y2="50" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="140" y1="42" x2="132" y2="52" stroke="#666" stroke-width="2" stroke-linecap="round"/>
    `;
  }

  let spots = '';
  if (isSpotted) {
    spots = `
      <circle cx="75" cy="70" r="5" fill="#A0522D" opacity="0.6"/>
      <circle cx="120" cy="65" r="4" fill="#A0522D" opacity="0.6"/>
      <circle cx="95" cy="95" r="6" fill="#A0522D" opacity="0.5"/>
      <circle cx="135" cy="85" r="3" fill="#A0522D" opacity="0.6"/>
    `;
  }

  const darkFace = isSealPoint ? '#5C3317' : fur.body;
  const darkEars = isSealPoint ? '#5C3317' : fur.body;
  const bodyColor = fur.body;

  let outfitLayer = '';
  if (cat.outfit.id === 'sweater') {
    outfitLayer = `
      <rect x="68" y="82" width="104" height="50" rx="8" fill="#CC3333"/>
      <line x1="120" y1="82" x2="120" y2="132" stroke="#FFD700" stroke-width="2"/>
      <rect x="82" y="95" width="8" height="8" rx="2" fill="#FFD700"/>
      <rect x="150" y="95" width="8" height="8" rx="2" fill="#FFD700"/>
    `;
  } else if (cat.outfit.id === 'jacket') {
    outfitLayer = `
      <path d="M68,85 L70,132 L170,132 L172,85 Z" fill="#2C3E50"/>
      <line x1="120" y1="85" x2="120" y2="132" stroke="#F0E6D2" stroke-width="2"/>
      <circle cx="112" cy="100" r="2" fill="#FFD700"/>
      <circle cx="112" cy="112" r="2" fill="#FFD700"/>
      <circle cx="128" cy="100" r="2" fill="#FFD700"/>
      <circle cx="128" cy="112" r="2" fill="#FFD700"/>
    `;
  } else if (cat.outfit.id === 'cloak') {
    outfitLayer = `
      <path d="M55,75 Q60,132 50,145 L190,145 Q180,132 185,75 Q160,80 120,85 Q80,80 55,75 Z" fill="#4A148C" opacity="0.85"/>
      <path d="M55,75 Q60,132 50,145" stroke="#FFD700" stroke-width="1.5" fill="none"/>
      <path d="M185,75 Q180,132 190,145" stroke="#FFD700" stroke-width="1.5" fill="none"/>
      <circle cx="120" cy="78" r="4" fill="#FFD700"/>
    `;
  }

  let hatLayer = '';
  if (cat.hat.id === 'tophat') {
    hatLayer = `
      <rect x="95" y="8" width="50" height="28" rx="3" fill="#1A1A1A"/>
      <rect x="82" y="32" width="76" height="8" rx="3" fill="#1A1A1A"/>
      <rect x="95" y="8" width="50" height="4" fill="#8B0000"/>
    `;
  } else if (cat.hat.id === 'crown') {
    hatLayer = `
      <polygon points="88,35 95,12 104,28 112,8 120,28 128,8 136,28 144,12 152,35" fill="#FFD700"/>
      <rect x="88" y="32" width="64" height="8" rx="2" fill="#DAA520"/>
      <circle cx="104" cy="36" r="2" fill="#FF0000"/>
      <circle cx="120" cy="36" r="2" fill="#00FF00"/>
      <circle cx="136" cy="36" r="2" fill="#0070FF"/>
    `;
  } else if (cat.hat.id === 'beret') {
    hatLayer = `
      <ellipse cx="120" cy="28" rx="42" ry="14" fill="#8B0000"/>
      <circle cx="120" cy="20" r="5" fill="#8B0000"/>
      <ellipse cx="130" cy="28" rx="30" ry="10" fill="#A52A2A"/>
    `;
  } else if (cat.hat.id === 'wizard') {
    hatLayer = `
      <polygon points="120,0 88,38 152,38" fill="#1A0533"/>
      <ellipse cx="120" cy="38" rx="42" ry="8" fill="#2D0866"/>
      <polygon points="120,0 118,35 122,35" fill="#FFD700"/>
      <ellipse cx="120" cy="40" rx="38" ry="3" fill="#A335EE" opacity="0.6"/>
      <circle cx="145" cy="28" r="3" fill="#FFD700" opacity="0.7"/>
      <circle cx="98" cy="30" r="2" fill="#00F0FF" opacity="0.7"/>
    `;
  }

  let accessoryLayer = '';
  if (cat.accessory.id === 'glasses') {
    accessoryLayer = `
      <circle cx="100" cy="55" r="8" fill="none" stroke="#FFD700" stroke-width="2"/>
      <circle cx="140" cy="55" r="8" fill="none" stroke="#FFD700" stroke-width="2"/>
      <line x1="108" y1="55" x2="132" y2="55" stroke="#FFD700" stroke-width="2"/>
      <line x1="92" y1="55" x2="78" y2="50" stroke="#FFD700" stroke-width="1.5"/>
      <line x1="148" y1="55" x2="162" y2="50" stroke="#FFD700" stroke-width="1.5"/>
    `;
  } else if (cat.accessory.id === 'scarf') {
    accessoryLayer = `
      <path d="M78,72 Q120,82 162,72 Q160,90 155,100 L155,130 Q140,135 120,130 L120,105 Q120,95 130,90" fill="#E53935"/>
      <path d="M78,72 Q120,82 162,72" stroke="#B71C1C" stroke-width="1"/>
    `;
  } else if (cat.accessory.id === 'bowtie') {
    accessoryLayer = `
      <circle cx="120" cy="85" r="4" fill="#FFD700"/>
      <polygon points="120,85 105,75 108,85 105,95" fill="#FFD700"/>
      <polygon points="120,85 135,75 132,85 135,95" fill="#FFD700"/>
    `;
  } else if (cat.accessory.id === 'headphones') {
    accessoryLayer = `
      <path d="M78,50 Q78,25 120,22 Q162,25 162,50" fill="none" stroke="#424242" stroke-width="4"/>
      <rect x="68" y="44" width="14" height="18" rx="4" fill="#424242"/>
      <rect x="158" y="44" width="14" height="18" rx="4" fill="#424242"/>
      <rect x="70" y="48" width="10" height="10" rx="2" fill="#0070FF"/>
      <rect x="160" y="48" width="10" height="10" rx="2" fill="#0070FF"/>
    `;
  }

  const eyeHighlight = isBlack ? '#FFD700' : '#FFFFFF';

  return `<svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="catShadow${cat.id}">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <g filter="url(#catShadow${cat.id})">
    <ellipse cx="120" cy="130" rx="48" ry="42" fill="${bodyColor}"/>
    <ellipse cx="82" cy="120" rx="16" ry="10" fill="${bodyColor}" transform="rotate(-15,82,120)"/>
    <ellipse cx="158" cy="120" rx="16" ry="10" fill="${bodyColor}" transform="rotate(15,158,120)"/>
    <ellipse cx="82" cy="160" rx="14" ry="10" fill="${bodyColor}"/>
    <ellipse cx="158" cy="160" rx="14" ry="10" fill="${bodyColor}"/>
    ${spots}
    ${outfitLayer}
    <circle cx="120" cy="60" r="35" fill="${darkFace}"/>
    <polygon points="90,42 82,15 102,35" fill="${darkEars}"/>
    <polygon points="90,42 85,22 98,35" fill="${innerEar}" opacity="0.6"/>
    <polygon points="150,42 158,15 138,35" fill="${darkEars}"/>
    <polygon points="150,42 155,22 142,35" fill="${innerEar}" opacity="0.6"/>
    ${stripes}
    <ellipse cx="105" cy="55" rx="8" ry="9" fill="${eyes.color}"/>
    <ellipse cx="135" cy="55" rx="8" ry="9" fill="${eyes.color}"/>
    <ellipse cx="105" cy="55" rx="3.5" ry="6" fill="#111"/>
    <ellipse cx="135" cy="55" rx="3.5" ry="6" fill="#111"/>
    <ellipse cx="107" cy="52" rx="2" ry="2" fill="${eyeHighlight}" opacity="0.8"/>
    <ellipse cx="137" cy="52" rx="2" ry="2" fill="${eyeHighlight}" opacity="0.8"/>
    <polygon points="117,65 120,60 123,65" fill="${nose}"/>
    <path d="M120,65 Q120,72 112,72" stroke="#555" stroke-width="1" fill="none"/>
    <path d="M120,65 Q120,72 128,72" stroke="#555" stroke-width="1" fill="none"/>
    <line x1="75" y1="60" x2="105" y2="65" stroke="${whiskerColor}" stroke-width="0.8"/>
    <line x1="75" y1="67" x2="105" y2="68" stroke="${whiskerColor}" stroke-width="0.8"/>
    <line x1="75" y1="74" x2="105" y2="71" stroke="${whiskerColor}" stroke-width="0.8"/>
    <line x1="165" y1="60" x2="135" y2="65" stroke="${whiskerColor}" stroke-width="0.8"/>
    <line x1="165" y1="67" x2="135" y2="68" stroke="${whiskerColor}" stroke-width="0.8"/>
    <line x1="165" y1="74" x2="135" y2="71" stroke="${whiskerColor}" stroke-width="0.8"/>
    <path d="M168,115 Q180,130 175,150" stroke="${bodyColor}" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${hatLayer}
    ${accessoryLayer}
  </g>
</svg>`;
}

function generateCatData(index) {
  return {
    id: index,
    name: pick(CAT_NAMES),
    description: pick(CAT_DESCRIPTIONS),
    furColor: pick(FUR_COLORS),
    eyeStyle: pick(EYE_STYLES),
    outfit: pick(OUTFITS),
    hat: pick(HATS),
    accessory: pick(ACCESSORIES),
    rarity: pickRarity(),
    mana: randomInt(1, 10),
    attack: randomInt(1, 12),
    health: randomInt(1, 12)
  };
}

function renderMinionCard(cat) {
  const card = document.createElement('div');
  card.className = `minion-card rarity-${cat.rarity.id}`;
  card.dataset.catId = cat.id;

  const svg = generateCatSVG(cat);

  card.innerHTML = `
    <div class="mana-cost">${cat.mana}</div>
    <div class="card-portrait">${svg}</div>
    <div class="card-name">${cat.name}</div>
    <div class="card-divider" style="background: ${cat.rarity.color}"></div>
    <div class="card-description">${cat.description}</div>
    <div class="card-attack">⚔${cat.attack}</div>
    <div class="card-health">❤${cat.health}</div>
    <div class="card-rarity-label" style="color: ${cat.rarity.color}">${cat.rarity.id.toUpperCase()}</div>
  `;

  card.style.setProperty('--rarity-color', cat.rarity.color);
  card.style.setProperty('--rarity-glow', cat.rarity.glow);

  return card;
}

function refreshAllCats() {
  const gallery = document.getElementById('cats-gallery');
  if (!gallery) return;

  const oldCards = gallery.querySelectorAll('.minion-card');

  oldCards.forEach(card => {
    const catId = parseInt(card.dataset.catId);
    const catData = generateCatData(catId);
    const newCard = renderMinionCard(catData);

    newCard.style.opacity = '0';
    newCard.style.transform = 'scale(0.85)';

    card.replaceWith(newCard);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newCard.style.opacity = '1';
        newCard.style.transform = 'scale(1)';
      });
    });
  });
}

function refreshSingleCard(catId) {
  const gallery = document.getElementById('cats-gallery');
  if (!gallery) return;

  const card = gallery.querySelector(`[data-cat-id="${catId}"]`);
  if (!card) return;

  const catData = generateCatData(catId);
  const newCard = renderMinionCard(catData);

  newCard.style.opacity = '0';
  newCard.style.transform = 'scale(0.85) rotateY(20deg)';

  card.replaceWith(newCard);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newCard.style.opacity = '1';
      newCard.style.transform = 'scale(1) rotateY(0deg)';
    });
  });
}

function initCats() {
  const gallery = document.getElementById('cats-gallery');
  if (!gallery) return;

  gallery.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const catData = generateCatData(i);
    const card = renderMinionCard(catData);
    gallery.appendChild(card);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCats();

  setInterval(refreshAllCats, 5000);

  const gallery = document.getElementById('cats-gallery');

  gallery.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.minion-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) scale(1.05)`;
  });

  gallery.addEventListener('mouseleave', (e) => {
    const cards = gallery.querySelectorAll('.minion-card');
    cards.forEach(card => {
      card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
  });

  gallery.addEventListener('click', (e) => {
    const card = e.target.closest('.minion-card');
    if (!card) return;

    const catId = parseInt(card.dataset.catId);
    refreshSingleCard(catId);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.contact-content, .cats-section, .minion-card').forEach(el => observer.observe(el));

  document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.orb');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    orbs.forEach((orb, i) => {
      orb.style.transform = `translate(${x * (i + 1) * 20}px, ${y * (i + 1) * 20}px)`;
    });
  });
});