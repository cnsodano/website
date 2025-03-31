

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
    let apiResponse = data
    console.log(apiResponse.message)
    let journals = apiResponse.message.items
    let $table = $(tableSelector)
    let body = `<a href = "https://api.crossref.org/journals?query=russian+law+journal" > API request:</a><code>"https://api.crossref.org/journals?query=${query}"</code>
        <table>
                    <tr>
                    <th> Publisher</th>
                    <th>Journal Title</th>
                    <th>ISSN</th>
                    </tr>`
    for (let i in journals) {
        console.log(journals[ i ])
        if (i > iBreak) { break }
        body += `<tr><td>${journals[ i ].publisher}</td><td>${journals[ i ].title}</td><td>[ ${journals[ i ].ISSN.toString()} ]</td></tr>`
    }
    body += "</table>"
    $table.html(body)
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
$("#queryInputSubmit").on("click", (event) => {
    let dropdownItem = $("#collapseExample3 div.card")
    if (dropdownItem.css("height") !== "0px") { $("#aphaDisclaimer").remove(); return }
    query = $("#queryInput")[ 0 ].value.toLowerCase().split(" ").join("+")
    if (query === "american+journal+of+public+health") {
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



//#region MemberID form submit
$apiForm.on("submit", (event) => {
    event.preventDefault()
    if (memberIDinput.value === ""){
        $("#memberIDErrorMsg").text("Please try again with a valid Crossref Member ID")
        return
    }
    let link = `https://api.crossref.org/members/${memberIDinput.value}/works?facet=container-title:*&rows=0`
    debugger;
    window.location.href = link
})
//#endregion





