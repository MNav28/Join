/**
 * Base URL of the Firebase Realtime Database.
 */
const BASE_URL = 'https://joinproject-ac426-default-rtdb.europe-west1.firebasedatabase.app/';

/**
 * ID of the currently logged-in user.
 */
let userId;

/**
 * Information about the currently logged-in user.
 */
let userInfo;

/**
 * Indicator for whether offline mode is active.
 */
let offlineMod = false;

/**
 * Array of all contacts, locally stored.
 */
let contactsLS = [];

/**
 * Array of contacts' details without the ID.
 */
let contactsOnly = [];

/**
 * Color palette for selecting user initials.
 */
const colors = [
    '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1',
    '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B',
    '#FFE62B', '#FF4646', '#FFBB2B', '#462F8A'
];

/**
 * Initializes the application by checking the login status, loading user data,
 * and rendering the appropriate page content based on the `html` argument.
 * 
 * @param {string} html - The name of the page to render ('board', 'contacts', 'summary', etc.).
 */
async function init(html) {
    if (checkLoginStatus(html)) {
        
        await updateLS();
        loadUser();
        
        renderHeader(html);
        renderNavBar(html);
        
        if (html == 'board') {
            boardJS();
        } else if (html == 'contacts') {
            contactsJS();
        } else if(html == 'summary'){
            summaryJS();
        }
    }
}

/**
 * Renders the navigation bar based on the current page (`html`).
 * Updates active links and hides elements based on the page and offline mode.
 * 
 * @param {string} html - The current page.
 */
function renderNavBar(html) {
    document.getElementById('navBar').innerHTML = navbarTemplate();
    removeActiveLink('.nav-links a', 'nav-active');
    removeActiveLink('.copyright-links a', 'copyright-activ');
    
    if (html == 'help') {
        return;
    };

    let className = 'nav-active';
    if (html == 'privacyPolicy' || html == 'legalNotice') {
        className = 'copyright-activ';
        if (offlineMod) {
            document.getElementById('navLinks').style.display = 'none';

            document.getElementById('navBar').classList.add("mobile-hide");
            document.getElementById('navLinks').classList.add("mobile-hide");
            document.getElementById('main').classList.add("mobile-h-unset");
            document.body.classList.add("mobile-h-unset");
        }
    }

    document.getElementById(`${html}Link`).classList.add(className);
}

/**
 * Removes the specified class from all elements matching the selector.
 * 
 * @param {string} selectElements - The CSS selector to find elements.
 * @param {string} className - The class to remove.
 */
function removeActiveLink(selectElements, className) {
    document.querySelectorAll(selectElements).forEach(element => {
        if (element.classList.contains(className)) {
          element.classList.remove(className);
        }
    });
}

/**
 * Renders the header with user initials and hides or shows buttons based on the current page.
 * 
 * @param {string} html - The current page (optional).
 */
function renderHeader(html = '') {
    let initials = getUserInitials() || 'G';
    document.getElementById('header').innerHTML = returnHeaderHtml(initials);
    
    if (html == 'help') {
        return hideHelpButton();
    };
    
    if (html == 'privacyPolicy' || html == 'legalNotice') {
        return hideHeaderButtons();
    }
}

/**
 * Hides the help button.
 */
function hideHelpButton() {
    document.getElementById('helpButton').style.display = 'none';
}

/**
 * Hides the header buttons container.
 */
function hideHeaderButtons() {
    document.getElementById('headerButtonsContainer').style.display = 'none';
}

/**
 * Toggles the visibility of the popup.
 */
function showPopUp(){
    document.getElementById("popUp").classList.toggle("d-none");
}

/**
 * Updates the local storage with the current list of sorted contacts.
 */
async function updateLS() {
    let contactsArr = await getWhoelParthArr('contacts')
    let sortetContacts = sortArrayContacts(contactsArr);
    contactsLS = sortetContacts;
    for (let i = 0; i < sortetContacts.length; i++) {
        contactsOnly.push(sortetContacts[i][1])
    }
}

/**
 * Fetches data from the given path in the Firebase database and returns it as an array of entries.
 * 
 * @param {string} path - The path in the Firebase database.
 * @returns {Promise<Array>} - A promise resolving to an array of database entries.
 */
async function getWhoelParthArr(path) {
    let responseJson = await getData(path);
    let whoelParthArr = Object.entries(responseJson);
    return whoelParthArr;
}

/**
 * Sorts an array of contacts alphabetically by name.
 * 
 * @param {Array} contactsArr - The array of contacts to be sorted.
 * @returns {Array} - The sorted array of contacts.
 */
function sortArrayContacts(contactsArr) {
    const sortedArray = contactsArr.sort((a, b) => {
        const nameA = a[1].name.toLowerCase();
        const nameB = b[1].name.toLowerCase();
      
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1; 
        return 0;
    });
    return sortedArray;
}

/**
 * Fetches data from the specified path in the Firebase database.
 * 
 * @param {string} path - The path to fetch data from.
 * @returns {Promise<Object>} - A promise resolving to the data fetched from the database.
 */
async function getData(path='') {
    let response = await fetch(BASE_URL + path + '.json');
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Sends a POST request to the specified path with the provided data to the Firebase database.
 * 
 * @param {string} path - The path to send data to.
 * @param {Object} data - The data to send in the request.
 * @returns {Promise<Object>} - A promise resolving to the response from the database.
 */
async function postData(path='', data={}) {
    let response = await fetch(BASE_URL + path + '.json', {
        method: 'post',
        header: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Sends a DELETE request to the specified path in the Firebase database.
 * 
 * @param {string} path - The path to delete data from.
 * @returns {Promise<Object>} - A promise resolving to the response from the database.
 */
async function deleteData(path='') {
    let response = await fetch(BASE_URL + path + '.json', {
        method: 'DELETE',
    });
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Sends a PUT request to the specified path with the provided data to the Firebase database.
 * 
 * @param {string} path - The path to update data in.
 * @param {Object} data - The data to update.
 * @returns {Promise<Object>} - A promise resolving to the response from the database.
 */
async function putData(path='', data={}) {
    let response = await fetch(BASE_URL + path + '.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Fetches the ID from the database where the specified key has a value matching `includeValue`.
 * 
 * @param {string} path - The path in the Firebase database to search in.
 * @param {string} key - The key to match in the database.
 * @param {string} includeValue - The value to match.
 * @returns {Promise<string>} - A promise resolving to the ID of the matching entry.
 */
async function getIdFromDb(path, key, includeValue) {
    let contactsPath = await getData(path);

    let allEntiesArr = Object.entries(contactsPath);
    let searchElement = allEntiesArr.filter(element => element[1][key] == includeValue);
    let searchId = searchElement[0][0];
    return searchId;
}

/**
 * Creates the initials from a full name by taking the first letter of the first and last name.
 * If the name has only one part, the second letter of the first name is used for the initials.
 * 
 * @param {string} name - The full name to generate initials from.
 * @returns {string} - The initials formed from the name.
 */
function createInitials(name) {
    let nameParts = name.split(/\s+/);
    let initials = nameParts[0].charAt(0).toUpperCase();
    
    if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    } else {
        initials += nameParts[0].charAt(1).toUpperCase();
    }
    return initials;
}

/**
 * Counts the usage of each color in the contacts list and returns an object mapping each color to its usage count.
 * 
 * @returns {Object} - An object where the keys are colors and the values are usage counts.
 */
function getUsageColors() {
    let colorUsage = colors.reduce((acc, color) => {
        acc[color] = 0;
        return acc;
    }, {});
    
    contactsOnly.forEach(contact => colorUsage[contact.color] ++);
    return colorUsage;
}

/**
 * Selects a color randomly from the available colors, with the probability weighted by how many times the color has been used.
 * Colors that are used less frequently are more likely to be selected.
 * 
 * @returns {string} - A randomly selected color from the color palette.
 */
function getRandomColor() {
    let colorUsage = getUsageColors();
    const weightedColors = [];
    
    colors.forEach(color => {
        const usageCount = colorUsage[color];
        const weight = Math.max(5 - usageCount, 1);
        for (let i = 0; i < weight; i++) {
            weightedColors.push(color);
        }
    });

    const randomColor = weightedColors[Math.floor(Math.random() * weightedColors.length)];
    return randomColor;
}

/**
 * Loads the current user's data from local storage. If the user is a guest, assigns 'guest' as the userInfo.
 * If the user is logged in, fetches the user details from the contacts list.
 */
function loadUser() {
    userId = localStorage.getItem("user");
    if (userId == 'guest' || userId == null) {
        userInfo = 'guest';
    } else {
        let user = getUserFromContacts(userId);
        userInfo = user[1];
    }
}

/**
 * Finds a user in the contacts list based on their ID.
 * 
 * @param {string} id - The ID of the user to find.
 * @returns {Array} - The user data if found, otherwise undefined.
 */
function getUserFromContacts(id) {
    let user = contactsLS.find(contact => contact[0] == id);
    return user;
}

/**
 * Retrieves the initials of the currently logged-in user.
 * 
 * @returns {string} - The initials of the logged-in user.
 */
function getUserInitials() {
    return userInfo.initials;
}

/**
 * Checks if the user is logged in. If not, it redirects the user to the login page unless the current page is public.
 * If the user is not logged in, and the page is not public, it redirects to the login page.
 * 
 * @param {string} html - The name of the current page.
 * @returns {boolean} - Returns true if the user is logged in or the page is public, otherwise false.
 */
function checkLoginStatus(html) {
    let user = localStorage.getItem("user");
    let logIn = localStorage.getItem("logIn") == "true";

    const publicPages = ['legalNotice', 'privacyPolicy'];

    if (!logIn) {
        if (!publicPages.includes(html)) {
            window.location.href = "./index.html";
        } else {
            offlineMod = true;
            return true;
        }
    } else {
        return true;
    }
}

/**
 * Logs the user out by removing login-related information from local storage.
 * If 'remember me' is not checked, it also removes the user ID from local storage.
 */
function logOut() {
    let remember = localStorage.getItem("remember") == "true";
    localStorage.removeItem('logIn');
    if (!remember) {localStorage.removeItem('user')}
}
