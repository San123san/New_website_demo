// Number of articles initially displayed
let displayedArticles = parseInt(localStorage.getItem('displayedArticles')) || 10;
const articlesToLoad = 9; // Number of articles to load when "Read More" is clicked
let shuffledNewsData = []; // Will store shuffled articles

document.addEventListener('DOMContentLoaded', function () {
    // Load the default sample news data
    loadSampleNewsData();

    // Retrieve the selected category from local storage
    const selectedCategory = localStorage.getItem('selectedCategory');

    if (selectedCategory) {
        // If a category is selected, load data for that category
        loadNewsData(selectedCategory);
    }
});

function loadSampleNewsData() {
    // Fetch the JSON data for all categories and combine them
    const iplData = fetch('ipl-news.json').then(response => response.json());
    const financeData = fetch('finance-news.json').then(response => response.json());
    const sportData = fetch('sport-news.json').then(response => response.json());
    const sampleData = fetch('sample-news-data.json').then(response => response.json());

    Promise.all([iplData, financeData, sportData, sampleData])
        .then(data => {
            // Combine data from all categories into a single array
            shuffledNewsData = shuffleArray(data.flat());
            displayInitialArticles(shuffledNewsData);
        })
        .catch(error => {
            console.error('Error loading sample news data:', error);
        });

    // Set the selected category to "home"
    localStorage.setItem('selectedCategory', 'home');
}

function loadNewsData(category) {
    // Define the URLs for the JSON data files for each category
    const dataUrls = {
        'ipl': 'ipl-news.json',
        'finance': 'finance-news.json',
        'sport': 'sport-news.json',
    };

    // Fetch the JSON data for the selected category
    fetch(dataUrls[category])
        .then(response => response.json())
        .then(data => {
            shuffledNewsData = shuffleArray(data);
            displayInitialArticles(shuffledNewsData);
        })
        .catch(error => {
            console.error('Error loading news data:', error);
        });
}

function displayInitialArticles(articles) {
    const cardsContainer = document.getElementById('cards-container');
    const newsCardTemplate = document.getElementById('template-news-card');

    cardsContainer.innerHTML = '';

    const articlesToDisplay = articles.slice(0, displayedArticles);

    articlesToDisplay.forEach(article => {
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });

    // Check if there are more articles to load
    if (articles.length <= displayedArticles) {
        readMoreButton.style.display = 'none'; // Hide the "Read More" button
    } else {
        readMoreButton.style.display = 'block'; // Show the "Read More" button
    }
}

function shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function fillDataInCard(cardClone, article) {
    const newsImage = cardClone.querySelector('#news-img');
    const newsTitle = cardClone.querySelector('#news-title');
    const newsSource = cardClone.querySelector('#news-source');
    const newsDesc = cardClone.querySelector('#news-desc');

    newsImage.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta"
    });

    newsSource.innerHTML = `${article.source.name} . ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

const readMoreButton = document.getElementById('read-more-button');
readMoreButton.addEventListener('click', () => {
    displayedArticles += articlesToLoad;
    displayInitialArticles(shuffledNewsData);
});

// Handle category button clicks
document.getElementById('home').addEventListener('click', () => onNavItemClick('home'));
document.getElementById('ipl').addEventListener('click', () => onNavItemClick('ipl'));
document.getElementById('finance').addEventListener('click', () => onNavItemClick('finance'));
document.getElementById('sport').addEventListener('click', () => onNavItemClick('sport'));

// Function to load news data for the selected category
function onNavItemClick(category) {

    scrollToTop()

    // Store the selected category in local storage
    localStorage.setItem('selectedCategory', category);

    if (category === 'home') {
        // If the "Home" category is selected, load the default sample news data
        loadSampleNewsData();
    } else {
        // Load news data for the selected category
        loadNewsData(category);
    }
}

// Search functionality
function onSearchClick() {
    // Retrieve the search input
    const searchInput = document.getElementById('search-text').value.toLowerCase();

    // Fetch all news data from all categories
    const allDataPromises = [
        fetch('sample-news-data.json').then(response => response.json()),
        fetch('ipl-news.json').then(response => response.json()),
        fetch('finance-news.json').then(response => response.json()),
        fetch('sport-news.json').then(response => response.json()),
    ];

    // Combine all data from different categories into a single array
    Promise.all(allDataPromises)
        .then(data => {
            const allNewsData = data.flat();

            // Filter news data based on the search input
            const filteredNewsData = allNewsData.filter(article => {
                return article.category && article.category.toLowerCase().includes(searchInput);
            });

            displayedArticles = articlesToLoad; // Reset the displayed article count

            const noResultsMessage = document.getElementById('no-results-message');
            const readMoreButton = document.getElementById('read-more-button');

            if (filteredNewsData.length === 0) {
                noResultsMessage.style.display = 'block'; // Show the "No such news" message
                readMoreButton.style.display = 'none'; // Hide the "Read More" button
            } else {
                noResultsMessage.style.display = 'none'; // Hide the "No such news" message
                readMoreButton.style.display = 'block'; // Show the "Read More" button
            }

            displayInitialArticles(filteredNewsData);
        })
        .catch(error => {
            console.error('Error loading news data:', error);
        });
}

// Add an event listener to the search button
document.getElementById('search-button').addEventListener('click', onSearchClick);

// Initialize displayedArticles from local storage or set it to 10 by default

function scrollToTop(){
    window.scrollTo(0,0);
}

