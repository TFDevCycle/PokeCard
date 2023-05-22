document.addEventListener('DOMContentLoaded', function() {
  const cardList = document.getElementById('cardList');
  const searchInput = document.getElementById('searchInput');
  const filterButton = document.getElementById('filterButton');
  const filterMenu = document.getElementById('filterMenu');
  const pagination = document.getElementById('pagination');

  let cardsData = [];
  const cardsPerPage = 20;
  let currentPage = 1;

  // Fetch all Pokemon cards
  fetchCards('https://api.pokemontcg.io/v2/cards', 'pokemon');

  // Fetch all Trainer cards
  fetchCards('https://api.pokemontcg.io/v2/cards', 'trainer');

  // Fetch all Energy cards
  fetchCards('https://api.pokemontcg.io/v2/cards', 'energy');

  function fetchCards(apiURL, cardType) {
    fetch(`${apiURL}?types=${cardType}`)
      .then(response => response.json())
      .then(data => {
        cardsData.push(...data.data);
        renderCards();
      })
      .catch(error => console.error(error));
  }

  function renderCards() {
    cardList.innerHTML = '';

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedCards = cardsData.slice(startIndex, endIndex);

    const cardRows = Math.ceil(paginatedCards.length / 4);

    for (let i = 0; i < cardRows; i++) {
      const row = document.createElement('div');
      row.classList.add('card-row');

      for (let j = i * 4; j < (i + 1) * 4; j++) {
        if (j < paginatedCards.length) {
          const card = paginatedCards[j];

          const cardDiv = document.createElement('div');
          cardDiv.classList.add('card');

          const cardImage = document.createElement('img');
          cardImage.src = card.images.small;
          cardImage.alt = card.name;

          const cardPrice = document.createElement('p');
          cardPrice.classList.add('card-price');
          const minPrice = getMinPrice(card);
          cardPrice.textContent = `Min Price: $${minPrice}`;

          const cardContainer = document.createElement('div');
          cardContainer.classList.add('card-container');
          cardContainer.appendChild(cardImage);
          cardContainer.appendChild(cardPrice);

          cardDiv.appendChild(cardContainer);
          row.appendChild(cardDiv);
        }
      }

      cardList.appendChild(row);
    }

    renderPagination();
  }

  function renderPagination() {
    const totalPages = Math.ceil(cardsData.length / cardsPerPage);
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.add('page-button');
      if (i === currentPage) {
        pageButton.classList.add('active');
      }

      pageButton.addEventListener('click', function() {
        currentPage = i;
        renderCards();
      });

      pagination.appendChild(pageButton);
    }
  }

  function getMinPrice(card) {
    const prices = card.tcgplayer && card.tcgplayer.prices;
    if (!prices) {
      return 'N/A';
    }

    const priceValues = Object.values(prices);
    const validPrices = priceValues.filter(price => price && price.market);

    if (validPrices.length === 0) {
      return 'N/A';
    }

    const minPrice = Math.min(...validPrices.map(price => price.market));
    return minPrice.toFixed(2);
  }

  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.trim();
    filterCards(searchTerm);
  });

  filterButton.addEventListener('click', function() {
    filterMenu.classList.toggle('show');
  });

  function filterCards(searchTerm) {
    const filteredCards = cardsData.filter(card => {
      const nameMatch = card.name.toLowerCase().includes(searchTerm);
      return nameMatch;
    });

    cardsData = filteredCards;
    currentPage = 1;
    renderCards();
  }
});
