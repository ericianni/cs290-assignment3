/**
 * Author: Eric Ianni
 * Date: 02/01/2015
 * File: assignment3Part2.js
 * Description: This program demonstrates the use of AJAX calls
 * from github.com/gists. The program parses the response and stores
 * the pertinent information localy allowing the user to set favorites
 * and to also filter the results.
 */
/**
 * When the window loads primes localStorage
 */
window.onload = function() {
    loadFavorites();        //loads the favorites from localStorage
    var temp = [];
    //wipes any localStorage for pages and listings upon fresh load
    localStorage.setItem('pages', JSON.stringify(temp));
    localStorage.setItem('listings', JSON.stringify(temp));
};

/**
 * Makes the request to github for the gists. Uses the passed number
 * to load a specific page. Parses the results and stores locally.
 * @param {number} number
 */
function loadPages(number)
{
    //makes sure no gists are present upon load
    emptyElement('gistList', 'listing');
    var url;
    //opens a new XMLHttprequest
    var pages = createXmlHttpRequestObject();
    //this url is supplied and number come from the id of the clicked
    //tab on the page
    url = 'https://api.github.com/gists/public?page=' + number;
    //prepares the request and sends it
    if (pages) {
        pages.open('GET', url, true);
        pages.send();
    }
    /**
     * Once the request is ready checks to make sure everything
     * has returned correctly.
     */
    pages.onreadystatechange = function()
    {
        //checks the status of the request
        if (pages.readyState === 4) {
            if (pages.status === 200) {
                //stores the response in pages as text
                localStorage.setItem('pages', pages.responseText);
                //calls a function to populate the page with gists
                //parseJSONElem(pages.responseText, 'listing');
                filter();
            }
            else {
                //catch all error
                alert('There was a problem with the request');
            }
        }
    };
}

/**
 * Creates an XMLHttpRequest as appropriate per the browser.
 * @return {xmlHTTP} returns a new XMLHttpRequest()}
 */
function createXmlHttpRequestObject() {
        var xmlHttp;
        if (window.XMLHttpRequest) {
                xmlHttp = new XMLHttpRequest();
        }else {
                xmlHttp = new ActiveXOjbect('Microsoft.XMLHTTP');
        }
        return xmlHttp;
}

/**
 * Function to parse any JSON element passed. Will also create
 * DOM elements based upon the type and then call a function
 * to filter the results
 * @param  {string} JSONELEM is the JSON element to be parsed
 * @param  {string} type is either 'favorite' or 'listing'
 * @param  {array} filter is the key(s) to filter the gists with
 */
function parseJSONElem(JSONELEM, type, filter)
{
    //parses the JSON string into an array of objects
    var parsedJSON = JSON.parse(JSONELEM);
    var listings = [];
    var value;
    var elem;
    //loops through the array and fills the listings array
    for (var x = 0; x < parsedJSON.length; x++) {
        listings[x] = new listing(parsedJSON[x]);
        //creates an element to append with the gist data
        elem = createListingElem(listings[x], type);
        //weeds out Favorites and Filtered Languages
        if (!isFav(elem) && isFiltered(elem, filter)) {
            //appends the object to the gistList element
           document.getElementById('gistList').appendChild(elem);
        }
    }
    //stores in localStorage as listings in JSON format
    localStorage.setItem('listings', JSON.stringify(listings));
}

/**
 * Checks to see if the element matches the filter key(s)
 * @param  {DOM} elem is the DOM element to be checked
 * @param  {array} filter is the key(s) to check with
 * @return {Boolean}
 */
function isFiltered(elem, filter) {
    //the first pass through this function there is no defined filter
    //this helps make sure the function is useful in two places
    if (typeof filter != 'undefined') {
        filter = JSON.parse(filter);
        if (filter == null || filter.length == 0) {
                return true;
        }
        var language = elem.getElementsByClassName('language')[0];
        //goes through each language and if a match is found return true
        for (var prop in filter) {
            if (language.textContent == filter[prop]) {
                return true;
            }
        }
    }
    //no match found or filter was undefined
    return false;
}

/**
 * Checks to see if a certain element is a favorite so it isn't
 * displayed in the Gist results
 * @param {DOM} elem DOM element to be checked
 * @return {Boolean}
 */
function isFav(elem) {
    //populates the favorite list from localStorage
    fav_list = [];
    fav_list = JSON.parse(localStorage.getItem('fav_list'));
    //if a element that is being asked to be displayed in listings
    //is also a favorite it will return true
    for (var prop in fav_list) {
        if (fav_list[prop].id == elem.id) {
            return true;
        }
    }
    //the item to be displayed is not a favorite
    return false;
}

/**
 * [getValue description]
 * @param {object} obj to be searched
 * @param {string} name the key to be searched for
 * @return {string} returns a string of the desired field
 */
function getValue(obj, name) {
    var prop;
    var data;
    //loops through all the nested elements to find the key
    for (prop in obj) {
        for (data in obj[prop]) {
            if (data == name)
                //returns the desired field
                return String(obj[prop][data]);
        }
    }
}

/**
 * Takes a parsed JSON object and saves only the needed
 * info in a constructor format
 * @param {object} obj is a parsed JSON object
 * @this listing
 */
function listing(obj) {
    this.language = getValue(obj['files'], 'language');
    if (this.language == 'null') {
        this.language = 'Not Specified';
    }
    if (obj['description'] != '') {
        this.description = obj['description'];
    } else {
        this.description = 'No Description';
    }
    this.url = obj['html_url'];
    this.id = obj['id'];
}

/**
 * Creates and appends DOM objects to one another to form
 * a new Gist Listing or Favorite
 * @param {object} obj is an object constructed from parsed JSON
 * @param  {string} type is either 'listing' or 'favorite'
 * @return {DOM} a new DOM element ready to be added to
 * the page
 */
function createListingElem(obj, type) {
    //starts by creating a new container div and
    //assigns the desired class and id
    var listing = document.createElement('div');
    listing.setAttribute('class', type);
    listing.setAttribute('id', obj.id);
    //creates another div to hold the description of the Gist
    //builds the hyperlink from obj's members
    //then appends to the container div
    var description = document.createElement('div');
    description.setAttribute('class', 'description');
    var url = '<a href="' + obj.url + '">' + obj.description + '</a>';
    description.innerHTML = url;
    listing.appendChild(description);
    //creates a div to hold the language text
    //appends to the container div
    var language = document.createElement('div');
    language.setAttribute('class', 'language');
    language.textContent = obj.language;
    listing.appendChild(language);
    //creates a div to hold the attributes of the favorite button
    //appends to the container class
    var fav_button = document.createElement('div');
    fav_button.setAttribute('class', 'fav_button');
    //if the element should show up in the Gist Results
    //it is labled 'listing' and the button is updated to
    //make it a favorite
    if (type === 'listing') {
        fav_button.textContent = 'Favorite';
        fav_button.setAttribute('onclick', 'set_Favorite(this.parentNode)');
    } else {
        //if the element should show up in Favorites
        //it is labled 'favorite' and the button is updated to
        //make UnFavorite
        if (type === 'favorite') {
                    fav_button.setAttribute('onclick',
                        'remove_Favorite(this.parentNode)');
                    fav_button.textContent = 'UnFavorite';
        } else {
            alert('There was an error with the type of listing');
        }
    }
    listing.appendChild(fav_button);
    return listing;
}

/**
 * Takes the passed listing and changes the attributes of the
 * DOM element so that it will appear in the Favorites Section
 * @param {string} listing is the DOM element to be modified
 */
function set_Favorite(listing) {
    //copies the listing to a new object
    var elem = listing;
    //modifies the class of the new object
    elem.setAttribute('class', 'favorite');
    //gistList is set to the DOM element that holds the Gists
    var gistList = document.getElementById('gistList');
    //the passed listing is removed from the Gist Results Section
    gistList.removeChild(document.getElementById(listing.id));
    //changes the button to now call the remove_Favorite function
    elem.getElementsByClassName('fav_button')[0].setAttribute('onclick',
        'remove_Favorite(this.parentNode)');
    //changes the text field of the button to "UnFavorite"
    elem.getElementsByClassName('fav_button')[0].textContent =
        'UnFavorite';
    //favorites is the DOM element that holds the saved favorites
    var favorites = document.getElementById('favorites');
    //appends the modifed element
    favorites.appendChild(elem);
    //local is used to hold the list of gist objects
    var local = JSON.parse(localStorage.getItem('listings'));
    //pulls the id of the passed listing
    var id = listing.getAttribute('id');
    //creates a new object to be assigned the passed listing
    list_obj = new Object();
    //builds a new object from the elements from the DOM element
    //should be it's own function but this works for now
    list_obj.id = listing.getAttribute('id');
    var tempLanguage = listing.getElementsByClassName('language');
    list_obj.language = tempLanguage[0].textContent;
    var tempDescription = listing.getElementsByClassName('description');
    list_obj.description = tempDescription[0].textContent;
    var url = listing.getElementsByClassName('description')[0].innerHTML;
    //removes the html tags from the url
    url = url.split('\"')[1];
    list_obj.url = url;
    var fav_list = [];
    //if no favorites are stored, push list_object onto empty array
    if (localStorage.getItem('fav_list') === null) {
        fav_list.push(list_obj);
    } else {
        //if there are locally saved favorites parse them and
        //push the new favorite onto the array
        fav_list = JSON.parse(localStorage.getItem('fav_list'));
        fav_list.push(list_obj);
    }
    //save all changes to localStorage in JSON format
    localStorage.setItem('fav_list', JSON.stringify(fav_list));
}

/**
 * Loads the favorites from localStorage and appends them to
 * the favorites section
 */
function loadFavorites() {
    var fav_list = [];
    fav_list = JSON.parse(localStorage.getItem('fav_list'));
    var elem;
    var favorites = document.getElementById('favorites');
    for (var prop in fav_list) {
        elem = createListingElem(fav_list[prop], 'favorite');
        favorites.appendChild(elem);
    }
}

/**
 * Removes a favorite when it's button is clicked
 * @param {DOM} favorite is the favorite to remove
 */
function remove_Favorite(favorite) {
    //copies the favorite so it can be added back to Gist Results
    var elem = favorite;
    //changes the class to listing thus labeling it a Gist Result
    elem.setAttribute('class', 'listing');
    //changes the button to favorite instead of remove
    elem.getElementsByClassName('fav_button')[0].setAttribute('onclick',
        'set_Favorite(this.parentNode)');
    //changes the text field of the button to "Favorite"
    elem.getElementsByClassName('fav_button')[0].textContent =
        'Favorite';
    //pulls the favorites div
    var favorites = document.getElementById('favorites');
    //removes the favorite from the favorite div
    favorites.removeChild(document.getElementById(favorite.id));
    //appends the modified element to the gist Result section
    var gistList = document.getElementById('gistList');
    gistList.appendChild(elem);
    //pulls the localStorage favorites list
    var local = JSON.parse(localStorage.getItem('fav_list'));
    //sets id to the id of the favorite we removed
    var id = favorite.getAttribute('id');
    list_obj = new Object();
    //temp will be where we build our new favorites list
    temp = [];
    //loops through the fav_list from storage and pushes
    //all the favorites EXCEPT the one we removed
    for (var prop in local) {
        if (local[prop].id != id)
        {
            list_obj = local[prop];
            temp.push(list_obj);
        }

    }
    //saves the new favorites list to localStorage
    localStorage.setItem('fav_list', JSON.stringify(temp));
    //calls the filter function to make sure the element we just
    //added to the listings section isn't being filtered out
    if (localStorage.getItem('listings').length > 2)
        filter();
}

/**
 * Filters the Gists being displayed by the checked boxes
 */
function filter() {
    //loads the locally saved response from GitHub
    var pages = localStorage.getItem('pages');
    //if no pages have been requested yet this conditional
    //goes ahead and calls loadPages to do so
    if (pages.length <= 2) {
        loadPages(1);
    }
    //pulls in all the checkbox items
    var checks = document.getElementsByName('checks');
    var languages = [];
    //for each checked box the language is pushed onto the array
    for (var x = 0; x < checks.length; x++)
    {
        if (checks[x].checked == true)
        {
            languages.push(checks[x].getAttribute('id'));
        }
    }
    //empties the gist list so it can be repopulated
    emptyElement('gistList', 'listing');
    //calls parseJSONElem and passes it the desired languages
    //this function wil repopulate the list
    parseJSONElem(pages, 'listing', JSON.stringify(languages));
}

/**
 * Empties the passed DOM element of all gists
 * @param {DOM} elem is the id of the element to empty
 * @param {string} type is the classname of the items to be removed
 */
function emptyElement(elem, type) {
    //pulls the DOM element with the id in elem
    var temp = document.getElementById(elem);
    //pulls a list of class type elements
    var toRemove = document.getElementsByClassName(type);
    var id;
    //removes each element in temp
    while (toRemove.length) {
        id = toRemove[0].id;
        temp.removeChild(document.getElementById(id));
    }

}
