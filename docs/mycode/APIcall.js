

// #region fetchCrossrefMember
async function fetchCrossrefMember(prefix) {
    const url = `https://api.crossref.org/v1/prefixes/${prefix}&mailto=cnsodano@gmail.com`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

async function fetchCrossrefMemberIDByQuery(query) {
    const url = `https://api.crossref.org/v1/members?query=${query}&mailto=cnsodano@gmail.com`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}
//#endregion

function resetMemberMessage(){
    $("#PmemberName").text("")
    $("#PmemberID").text("")
}

//#region getMemberId
function getMemberId(doi) {
    $("#failMemberFind").css("visibility", "hidden")
    const prefixRegex = /(?<=doi.*)10.[0-9\.]+(?=\/|\%)/g
    let prefix = doi.match(prefixRegex)
    if (prefix === null) { 
        resetMemberMessage();
        $("#failMemberFind").css("visibility","visible");
        throw new Error("Not a DOI, or does not have a valid prefix") }
    prefix = prefix[0] // _todo _audit for possible two match cases
    prefix = encodeURIComponent(prefix)
    const url = `https://api.crossref.org/v1/prefixes/${prefix}&mailto=cnsodano@gmail.com`
    fetch(url)
        .then(response => {
            response.json().then(data => {
                if (data) {
                    let memberID = data.message.member
                    const memberIDregex = /(?<=member\/)[0-9]+/
                    memberID = memberID.match(memberIDregex)[ 0 ]
                    memberIDinput.placeholder = memberID.toString()
                    $("#PmemberName").text(`Member name is ${data.message.name}`)
                    $("#PmemberID").text(`Member ID is ${memberID}`)
                }
            }).catch(error => {$("#failMemberFind").css("visibility", "visible"); return })
        }).then(() => { return memberID })
}
//#endregion



// #region Constants
let $doiForm = $("#CRdoiForm")
let $doiFormSubmit = $("#CRdoiSubmit")
let doiInput = $("#doiinput")[ 0 ]
let memberID;
let $apiForm = $("#CRapiForm")
let memberIDinput = $("#memberIDinput")[ 0 ]
// #endregion



//#region fetchCrossrefJournals
async function fetchCrossrefJournals(query) {
    // debugger;
    const url = `https://api.crossref.org/v1/journals?query=${query}&rows=30&mailto=cnsodano@gmail.com`; 
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}


async function displayJournalQueryResults(query, data, iBreak=30, tableSelector, showAll = false){ 
    // _todo add option to click to fetch in addition all memberIDs for the publishers retrieved (slow)
    query = cleanJournalName(query)
    queryAPI = query.toLowerCase().split(" ").join("+")
    let apiResponse = data
    // console.log(apiResponse.message)
    let journals = apiResponse.message.items
    let $table = $(tableSelector)
    let body = `
        <table>
                    <tr>
                    <th> Publisher</th>
                    <th>Journal Title</th>
                    <th>ISSN</th>
                    </tr>`
    let noClone = 0
    let publisherCache = {}
    let journalMemberID = "";
    for (let i in journals) {;
        // _todo _test handle invalid inputs that return nothing
        if (isClone(journals[i].title, query) || showAll) {
            noClone += 1
            console.log(journals[ i ])
            if (i > iBreak) { break }
            publisher = journals[ i ].publisher
            body += `<tr><td>${publisher} </td><td>${journals[ i ].title}</td><td>[ ${journals[ i ].ISSN.toString()} ]</td></tr>`
        }
    };
    let apiHeader = `<a href = "https://api.crossref.org/v1/journals?query=${queryAPI}&mailto=cnsodano@gmail.com" > API request:</a><code>"https://api.crossref.org/v1/journals?query=${queryAPI}"</code>`
    let result;
    if (noClone === 1){
        result = apiHeader + body + `</table>`+`<p>No duplicates found for ${query}`
    }
    if (noClone === 0) {
        result = apiHeader + `<p> No journal found for query '${query}'.</p><p>Perhaps try another journal or double-check for typos?</p><p>Keep in mind that this is not a comprehensive tool, and not all publishers/journals are registered with Crossref.</p>`
    }
    if (noClone > 1){
        result = apiHeader + body + `</table>`
    }
    $table.html(result)
}
//#endregion

//#endregion

// #region Journal Query Submit Handlers


//#region Show Two RLJs
$('#collapseExampleRLJ').on("show.bs.collapse", function () {
    let dropdownItem = $("#collapseExampleRLJ div.card")
    dropdownItem.prepend(`<p id="RLJDisclaimer">The publisher "Science Research Society" has managed to register two journals with the same title, but differing ISSN metadata, as the journal that they hijacked. The real RLJ has both an electronic and print ISSN.</p>`)
    query = "russian+law+journal"
    fetchCrossrefJournals(query).then((data) => {
        displayJournalQueryResults(query, data, 2, ".TablegetRLJ", showAll = true)
    })
});
$('#collapseExampleRLJ').on("hide.bs.collapse", () =>{
    resetDuplicateQueryDropdown(".TablegetRLJ")
    return;
    
});

async function getMemberIdFromQuery(query){
    let originalquery = query 
    query = cleanJournalName(query)
    queryAPI = query.toLowerCase().split(" ").join("+")
    data = await fetchCrossrefMemberIDByQuery(queryAPI)
    // let fuzzy = new Fuse(data.message.items, {keys:["primary-name"]}) _archive
    let result = data.message.items.filter(x => x[ "primary-name" ] === originalquery)
    if (result.length > 0) {
        //_todo _audit Error, should only be one member with this name. Check for edge cases where possible to have >1
    }
    result = result[ 0 ].id
    return result
}

getMemberIdFromQuery("Science Research Society")
//#endregion
//#region User-submit any journal query

// Fix refresh issue with text input. Solution from:
// https://stackoverflow.com/questions/895171/prevent-users-from-submitting-a-form-by-hitting-enter/17984162
$.each($("#queryFormid").find('input'), function () {
    $(this).bind('keypress keydown keyup', function (e) {
        if (e.keyCode == 13) { e.preventDefault();
            $("#queryInputSubmit").click() 
        }
    });
});

function resetDuplicateQueryDropdown(tableselector){
    if (tableselector === ".TablegetRLJ"){
        if (("#RLJDisclaimer").length > 0) {
            $("#RLJDisclaimer").remove()
        }
    } else { 
        if (("#aphaDisclaimer").length > 0) {
            $("#aphaDisclaimer").remove()
        }
    }
    $(tableselector).html(`<p class='loadingsign'>Loading...</p>`)
}

$('#collapseExampleGenericJournal').on("show.bs.collapse", function () {
    let dropdownItem = $("#collapseExampleGenericJournal div.card")
    let query = $("#queryInput").val()
    if (query === "American Journal of Public Health") {
        dropdownItem.prepend("<p id='aphaDisclaimer'>The publisher 'Springer Global Publications' (not to be confused with Springer Nature, which they <a href='https://retractionwatch.com/2024/11/25/exclusive-new-hijacking-scam-targets-elsevier-springer-nature-and-other-major-publishers/'>imitate</a>) has managed to register a journal with the same title as the American Public Health Association's 'American Journal of Public Health'. See <a href='https://api.crossref.org/v1/members/51526/works?query.container-title=american+journal+of+public+health'>this listing</a> for the hijacker's journal registry, compared to the <a href='https://api.crossref.org/v1/members/844/works?query.container-title=american+journal+of+public+health&rows=10'>original</a>. This journal has been listed on Retraction Watch's <a href='https://docs.google.com/spreadsheets/d/1ak985WGOgGbJRJbZFanoktAN_UFeExpE/edit?gid=5255084#gid=5255084'>Hijacked Journal Checker</a>) list")
    }
    fetchCrossrefJournals(query).then((data) => {
        displayJournalQueryResults(query, data, 30, ".TablegetJournalGeneric")
    })

});
$('#collapseExampleGenericJournal').on("hide.bs.collapse", () =>{
    resetDuplicateQueryDropdown(".TablegetJournalGeneric")
    return;
    
});
//#endregion
//#endregion


//#region DOI form submit
$doiFormSubmit.on("click", async (event) => {
    event.preventDefault()
    memberID =  await getMemberId(doiInput.value)
})
//#endregion

//#region Find Duplicate Journals from Publisher
$("#findAllHijackedJournals button").on("click", (event) =>{            
    event.preventDefault()
    if($("#soon").length>0){
        $("soon".remove())
    }
    $("#findAllHijackedJournals").append("<p id='soon'>Coming soon!</p>")
})
//#endregion

//#region MemberID form submit
$apiForm.on("submit", (event) => {
    event.preventDefault()
    if (memberIDinput.value === ""){
        $("#memberIDErrorMsg").text("Please try again with a valid Crossref Member ID")
        return
    }
    let link = `https://api.crossref.org/v1/members/${memberIDinput.value}/works?facet=container-title:*&rows=0&mailto=cnsodano@gmail.com`;
    window.location.href = link
})
//#endregion


// #region Helpers from elsewhere
function cleanJournalName(journalName) {
    ampersAndRegex = /(\s&amp;?\s)|(\s&\s)|(\sand\s)/g //_todo _audit check for cases where removing the "and" will cause issues and missing a normal journal
    journalName = journalName.replaceAll(ampersAndRegex, " ") // remove & from 
    return journalName
}

function isClone(queryJournalTitle, baseJournalTitle) {
    // _todo add sophistication so titles with a ": subtitle" and "<title> (abbreviation)" are also caught (see below)
    // _todo _critical add here a parenthesis handler 
    // r = /European Economic Letters(\s\(.*\))?\n/g (matches:
    /**
     *  European Economic Letters (EEL)
        European Economic Letters and Correspondences
        European Economic Letters

        _audit check if the \n at end should instead be turned into /\s?$/
     */;
    queryJournalTitle = cleanJournalName(queryJournalTitle)
    baseJournalTitle = cleanJournalName(baseJournalTitle) // If already cleaned, should do nothing _test that this is true
    // Using lodash https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js for browser compatibility
    let escapedTitle = _.escapeRegExp(baseJournalTitle)
    let pattern = "^" + escapedTitle + "\s?$"
    let regexPatternEscapedTitle = new RegExp(pattern, "i")
    let result = queryJournalTitle.match(regexPatternEscapedTitle)
    return result
}

function stringToBoolean(str) {
    if (str.toLowerCase() === "true") {
        return true;
    } else if (str.toLowerCase() === "false") {
        return false;
    } else {
        return false; // Or handle other cases as needed
    }
}
//#endregion


