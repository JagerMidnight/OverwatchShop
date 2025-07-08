import shopData from './pages/shop/shop.js';
import mythicData from './pages/shop/mythic-shop.js';
import seasonalData from './pages/shop/seasonal-shop.js';

const getNextTuesday12PMPDT = () => {
    const now = new Date();
    const nextTuesday = new Date(now);

    let daysUntilTuesday = (2 - now.getDay() + 7) % 7;

    if (daysUntilTuesday === 0) {
        const currentPDT = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        if (currentPDT.getHours() >= 12) {
            daysUntilTuesday = 7;
        }
    }

    nextTuesday.setDate(now.getDate() + daysUntilTuesday);
    nextTuesday.setHours(12, 0, 0, 0);

    const targetDateUTC = new Date(Date.UTC(
        nextTuesday.getFullYear(),
        nextTuesday.getMonth(),
        nextTuesday.getDate(),
        12 + 7,
        0, 0, 0
    ));

    if (targetDateUTC.getTime() < now.getTime()) {
        targetDateUTC.setDate(targetDateUTC.getDate() + 7);
    }

    return targetDateUTC;
};

const countdownTextElement = document.getElementById('countdown-text');

const updateCountdown = () => {
    const nextResetTime = getNextTuesday12PMPDT();
    const now = new Date();
    const timeRemaining = nextResetTime.getTime() - now.getTime();

    if (timeRemaining <= 0) {
        countdownTextElement.textContent = 'Shop has reset!';
        return;
    }

    const totalSeconds = Math.floor(timeRemaining / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        countdownTextElement.textContent = `Shop resets in ${days} day${days !== 1 ? 's' : ''}!`;
    } else {
        countdownTextElement.textContent =
            `${hours.toString().padStart(2, '0')} hours, ` +
            `${minutes.toString().padStart(2, '0')} minutes, ` +
            `${seconds.toString().padStart(2, '0')} seconds!`;
    }
};

const tabButtons = document.querySelectorAll('.tab-button');
const tabContent = document.getElementById('tab-content');
let currentActiveTab = 'shop';

const renderItemList = (title, items) => {
    let itemsHtml = '';
    if (items && items.length > 0) {
        itemsHtml = `
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${items.map(item => `
                    <div class="bg-gray-700 p-4 rounded-lg shadow-lg flex flex-col items-center text-center">
                        <img src="${item.imageUrl}" alt="${item.name}" class="w-32 h-32 rounded-lg mb-3 object-cover border-2 border-orange-500" onerror="this.onerror=null;this.src='https://placehold.co/150x150/CCCCCC/000000?text=Image+Error';" />
                        <h4 class="text-xl font-semibold text-white mb-1">${item.name}</h4>
                        ${item.type ? `<p class="text-gray-300 text-sm">${item.type}</p>` : ''}
                        ${item.price ? `<p class="text-green-400 font-bold mt-2">${item.price}</p>` : ''}
                        ${item.description ? `<p class="text-gray-400 text-sm mt-2">${item.description}</p>` : ''}
                        ${item.event ? `<p class="text-purple-400 text-sm mt-1">Event: ${item.event}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        itemsHtml = '<p class="text-gray-400">No items in this section yet.</p>';
    }

    return `
        <div class="mb-8 p-4 bg-gray-800 rounded-lg shadow-md">
            <h3 class="text-2xl font-bold text-orange-400 mb-4">${title}</h3>
            ${itemsHtml}
        </div>
    `;
};

const renderTabContent = async (tabName) => {
    tabContent.innerHTML = '<div class="text-center text-gray-400 py-10">Loading items...</div>';

    try {
        let contentHtml = '';
        if (tabName === 'shop') {
            contentHtml = `
                <h2 class="text-4xl font-extrabold text-green-400 mb-6 text-center">Shop</h2>
                ${renderItemList('Featured', shopData.featured)}
            `;
        } else if (tabName === 'mythic') {
            contentHtml = `
                <h2 class="text-4xl font-extrabold text-purple-400 mb-6 text-center">Mythic Shop</h2>
                ${renderItemList('Featured', mythicData.featured)}
                ${renderItemList('Available Soon', mythicData.availableSoon)}
                ${renderItemList('Previous Mythics', mythicData.previous)}
                ${renderItemList('Aspects', mythicData.aspects)}
            `;
        } else if (tabName === 'seasonal') {
            contentHtml = `
                <h2 class="text-4xl font-extrabold text-yellow-400 mb-6 text-center">Seasonal Shop</h2>
                ${renderItemList('Seasonal Items', seasonalData.seasonal)}
            `;
        }
        tabContent.innerHTML = contentHtml;
    } catch (error) {
        console.error("Error loading tab data:", error);
        tabContent.innerHTML = '<div class="text-center text-red-400 py-10">Failed to load shop data. Check module imports.</div>';
    }
};

const handleTabClick = (event) => {
    const clickedTab = event.target.id.replace('tab-', '');
    if (clickedTab === currentActiveTab) return;

    document.getElementById(`tab-${currentActiveTab}`).classList.remove('bg-blue-600', 'text-white', 'shadow-lg', 'scale-105');
    document.getElementById(`tab-${currentActiveTab}`).classList.add('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600');

    event.target.classList.remove('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600');
    event.target.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'scale-105');

    currentActiveTab = clickedTab;
    renderTabContent(currentActiveTab);
};

document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    setInterval(updateCountdown, 1000);

    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });

    renderTabContent(currentActiveTab);
});
