

// #region fetchCrossrefMember
async function fetchCrossrefMember(prefix) {
    const url = `https://api.crossref.org/prefixes/${prefix}`;
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
    prefix = prefix[0]
    const url = `https://api.crossref.org/prefixes/${prefix}`
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
        })
        }).then(() => {return memberID})
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
    const url = `https://api.crossref.org/journals?query=${query}`; 
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



function displayJournalQueryResults(query, data, iBreak=10, tableSelector){ 
    query = cleanJournalName(query)
    queryAPI = query.toLowerCase().split(" ").join("+")
    let apiResponse = data
    console.log(apiResponse.message)
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
    for (let i in journals) {;
        // _todo _test handle invalid inputs that return nothing
        if (isClone(journals[i].title, query)) {
            noClone += 1
            console.log(journals[ i ])
            if (i > iBreak) { break }
            body += `<tr><td>${journals[ i ].publisher}</td><td>${journals[ i ].title}</td><td>[ ${journals[ i ].ISSN.toString()} ]</td></tr>`
        }
    };
    let apiHeader = `<a href = "https://api.crossref.org/journals?query=russian+law+journal" > API request:</a><code>"https://api.crossref.org/journals?query=${queryAPI}"</code>`
    let result;
    if (noClone === 1){
        result = apiHeader + body + `</table>`+`<p>No duplicates found for ${query}`
    }
    if (noClone === 0) {
        result = apiHeader + `<p> No journal found for query '${query}'.</p><p>Perhaps try another journal or double-check for typos?</p>`
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
$("#getRLJ").on("click", (event) => {
    let dropdownItem = $("#collapseExampleRLJ div.card")
    if (dropdownItem.css("height") !== "0px") { $("#RLJDisclaimer").remove(); return }
    dropdownItem.prepend(`<p id="RLJDisclaimer">The publisher "Science Research Society" has managed to register two journals with the same title, but differing ISSN metadata, as the journal that they hijacked. The real RLJ has both an electronic and print ISSN.</p>`)
    query = "russian+law+journal"
    fetchCrossrefJournals(query).then((data) => {
        displayJournalQueryResults(query, data, 2, ".TablegetRLJ")
    })
})
//#endregion

//#region User-submit any journal query

function resetDuplicateQueryDropdown(){
    if (("#aphaDisclaimer").length>0){
        $("#aphaDisclaimer").remove()
    }
    $(".TablegetJournalGeneric").html(`<p class='loadingsign'>Loading...</p>`)
}
$("#myTextBox").on("input", function () {
    // Updates the value from the default if user inputes new value in text
    console.log($(this).val());
});
$("#queryInputSubmit").on("click", (event) => {   
    let dropdownItem = $("#collapseExample3 div.card")
    if (dropdownItem.css("height") !== "0px") {
        resetDuplicateQueryDropdown()
        return };
    let query = $("#queryInput").val()
    if (query === "American Journal of Public Health") {
        dropdownItem.prepend("<p id='aphaDisclaimer'>The publisher 'Springer Global Publications' (not to be confused with Springer Nature, which they <a href='https://retractionwatch.com/2024/11/25/exclusive-new-hijacking-scam-targets-elsevier-springer-nature-and-other-major-publishers/'>imitate</a>) has managed to hijack both the url (see the retraction watch <a href='https://docs.google.com/spreadsheets/d/1ak985WGOgGbJRJbZFanoktAN_UFeExpE/edit?gid=5255084#gid=5255084'>Hijacked Journal Checker</a>) and register a journal with the same title as the American Public Health Association's 'American Journal of Public Health'. See <a href='https://api.crossref.org/members/51526/works?query.container-title=american+journal+of+public+health'>this listing</a> for the hijacker's journal registry, compared to the <a href='https://api.crossref.org/members/844/works?query.container-title=american+journal+of+public+health&rows=10'>original</a>")
    }
    fetchCrossrefJournals(query).then((data) => {
        displayJournalQueryResults(query, data, 10, ".TablegetJournalGeneric")
    })
})
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
    let link = `https://api.crossref.org/members/${memberIDinput.value}/works?facet=container-title:*&rows=0`;
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
    let escapedTitle = RegExp.escape(baseJournalTitle)
    let pattern = "^" + escapedTitle + "\s?$"
    let regexPatternEscapedTitle = new RegExp(pattern, "i")
    let result = queryJournalTitle.match(regexPatternEscapedTitle)
    return result
}
//#endregion


