window.onload = function() {
    loadFavorites();
};

function loadPages()
{
    var radios = document.getElementsByName('pages');
    var numOfPages;
    var url;
    var pages = new XMLHttpRequest();
    for (var x = 0; x < radios.length; x++)
    {
        if (radios[x].checked == true)
        {
            numOfPages = radios[x].value;
        }
    }

    url = 'http://api.github.com/gists/public?page=' + numOfPages;
    //prompt(url);
    //prompt(url);
    pages.open('GET', url, true);
    pages.send();

    pages.onreadystatechange = function()
    {
        if (pages.readyState === 4) {
            if (pages.status === 200) {
                localStorage.setItem('pages', pages.responseText);
                parsePages(pages.responseText);
            }
            else {
                alert('There was a problem with the request');
            }
        }
    };
}

function parsePages(pages)
{
    //prompt(pages);
    var parsedJSON = JSON.parse(pages);
    var listings = [];
    var value;
    var elem;
    for (var x = 0; x < parsedJSON.length; x++) {
        listings[x] = new listing(parsedJSON[x]);
        elem = createListingElem(listings[x], 'listing');
        document.getElementById('gistList').appendChild(elem);
    }
    localStorage.setItem('listings', JSON.stringify(listings));
}


function getValue(obj, name) {
    var prop;
    var data;
    for (prop in obj) {
        //console.log(temp);
        for (data in obj[prop]) {
            if (data == name)
                return String(obj[prop][data]);
        }
    }
    

};

function listing(obj) {
    this.language = getValue(obj['files'], 'language');
    if (obj['description'] != '') {
        this.description = obj['description'];
    } else {
        this.description = 'No Description';
    }
    this.url = obj['html_url'];
    this.id = obj['id'];
};

function createListingElem(obj, type) {
    var listing = document.createElement('div');
    listing.setAttribute('class', type);
    listing.setAttribute('id', obj.id);

    var description = document.createElement('div');
    description.setAttribute('class', 'description');
    var url = '<a href="' + obj.url + '">' + obj.description + '</a>';
    description.innerHTML = url;
    listing.appendChild(description);

    var language = document.createElement('div');
    language.setAttribute('class', 'language');
    language.textContent = obj.language;
    listing.appendChild(language);
    
    var fav_button = document.createElement('div');
    fav_button.setAttribute('class', 'fav_button');
    if (type === 'listing') {
        fav_button.setAttribute('onclick', 'set_Favorite(this.parentNode)');
    } else {
        if (type === 'favorite') {
                    fav_button.setAttribute('onclick', 'remove_Favorite(this.parentNode)');
        } else {
            alert('There was an error with the type of listing');
        }
    }
    listing.appendChild(fav_button);

    /*var webpage = document.createElement('div');
    webpage.setAttribute('class', 'webpage');

    var script = document.createElement('script')
    script.setAttribute('class', 'portal');
    script.setAttribute('src', obj.url + '.js');
    webpage.appendChild(script);

    listing.appendChild(webpage);*/

    return listing;
};

function set_Favorite(listing) {
    var elem = listing;
    elem.setAttribute('class', 'favorites');
    var gistList = document.getElementById('gistList');
    gistList.removeChild(document.getElementById(listing.id));
    var favorites = document.getElementById('favorites');
    favorites.appendChild(elem);
    var local = JSON.parse(localStorage.getItem('listings'));
    var id = listing.getAttribute('id');
    list_obj = new Object();
    for (var prop in local) {
        if (local[prop].id == id)
        {
            list_obj = local[prop];
            console.log(typeof list_obj);
        }

    }
    var fav_list = [];
    if (typeof list_obj != 'object') {
        alert('The favorite wasn\'t found in the parsed list');
    } else {
        if (localStorage.getItem('fav_list') === null) {
            fav_list.push(list_obj);
        } else {
            fav_list = JSON.parse(localStorage.getItem('fav_list'));
            fav_list.push(list_obj);
        }
    }
    localStorage.setItem('fav_list', JSON.stringify(fav_list));
    
    //for()
    //console.log(test);
    //console.log(test[0]);
};

function loadFavorites() {
    var fav_list = [];
    fav_list = JSON.parse(localStorage.getItem('fav_list'));
    var elem;
    var favorites = document.getElementById('favorites');
    for (var prop in fav_list) {
        elem = createListingElem(fav_list[prop], 'favorite');
        favorites.appendChild(elem);
        console.log(prop);
    }
};

function remove_Favorite(favorite) {

};

