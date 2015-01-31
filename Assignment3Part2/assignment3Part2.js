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
    for (var x = 0; x < parsedJSON.length; x++) {
        listings[x] = new listing(parsedJSON[x]);
    }
    localStorage.setItem('listings', listings);
    //console.log(typeof te[0]);
    //console.log(test[2]['files'][0]['language']);
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
    this.description = obj['description'];
    this.url = obj['html_url'];
};