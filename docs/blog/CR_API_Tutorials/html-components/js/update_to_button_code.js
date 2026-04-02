
function openPopup() {
    document.querySelector('nav.navbar').classList.add("hidden");
    document.getElementById("api_hover_overlay").classList.add("open");
    document.getElementById("api_hover_raw_query_textInput").focus();
}

function closePopup() {
    document.querySelector('nav.navbar').classList.remove("hidden");
    document.getElementById("api_hover_overlay").classList.remove("open");
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById("api_hover_overlay")) closePopup();
}

async function handleSubmit(editorElementVar, prefix) {
    currentPage = 1;
    let inputValue = document.getElementById(`${prefix}_textInput`).value;
    let fullValue = inputValue;
    let result = await fetchAndRender(fullValue, prefix, editorElementVar);
    updateCursorState(inputValue, prefix, result);
}

async function handleNextPage(editorElementVar, prefix) {
    if (!nextCursor) return;
    currentPage++;
    document.getElementById(`${prefix}_page-display`).textContent = `Page ${currentPage} of ${totalPages}`;
    let input = document.getElementById(`${prefix}_textInput`);
    let current = input.value;
    let cursorIndex = current.indexOf("cursor=");
    input.value = current.substring(0, cursorIndex + "cursor=".length) + encodeURIComponent(nextCursor);
    let fullValue = input.value;
    let result = await fetchAndRender(fullValue, prefix, editorElementVar);
    updateCursorState(input.value, prefix, result);
}

async function fetchAndRender(fullUrl, prefix, editorElementVar) {
    let result = await apiCall2(fullUrl);
    result = render(result, editorElementVar)
    document.getElementById(`${prefix}_uri-encoded-output`).textContent = encodeURI(fullUrl);
    return result;
}


function render(json_, editorElementVar){
    content = {"text": undefined, "json":json_}
    editorElementVar.set(content);
    return json_;
}

function updateCursorState(inputValue, prefix, json) {
    const btn = document.getElementById(`${prefix}_next-page-btn`);
    const pageDisplay = document.getElementById(`${prefix}_page-display`);
    let hasCursorAvailableToShow = inputValue.includes("cursor=") && json?.message?.["next-cursor"]

    if (hasCursorAvailableToShow) {
        nextCursor = json.message["next-cursor"];
        btn.style.display = "inline-block";
    } else {
        nextCursor = null;
        btn.style.display = "none";
    }

    const totalResults = json?.message?.["total-results"];
    const itemsPerPage = json?.message?.items?.length;
    if (totalResults && itemsPerPage && hasCursorAvailableToShow) {
        totalPages = Math.ceil(totalResults / itemsPerPage);
        pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
        pageDisplay.style.display = "inline";
    } else {
        pageDisplay.style.display = "none";
    }
}

async function apiCall2(query) {
    const response = await fetch(query);
    if (response.ok) {
        const json = await response.json();
        return json;
    } else {
        console.error("errored");
    }
}


function lastLineMatches(str, pattern) {
    const lines = str.trim().split("\n");
    const lastLine = lines[lines.length - 1].trim();
    return pattern.test(lastLine);
}
// Pyodide code
function hasAttribute(obj, attr) {
    return obj != null &&
            obj != undefined &&
           typeof obj === "object" &&
           attr in obj 
}

async function submitAceEditor(pyodideReady, aceeditorElement, jsonEditorElement, prefix) {
    await pyodideReady;
    console.log(aceeditorElement.getValue());
    debugger
    if (lastLineMatches(aceeditorElement.getValue(), /json_result/) || lastLineMatches(aceeditorElement.getValue(), /response/)){
        returned = pyodide.runPython(`from pyodide.ffi import to_js\n${aceeditorElement.getValue()}`)
    } else {
          console.log("err must be json_result")
          throw new Error("not ending in response or json_result")
    }
    if (returned instanceof pyodide.ffi.PyProxy){
        res = returned.toJs()
    } else {
        res = returned
    }
    try {
        handleAceEditorSubmit(res, jsonEditorElement, prefix)
        if (returned instanceof pyodide.ffi.PyProxy){
            returned.destroy()
        }
    } catch (error) {
        console.log("error")
    }
    debugger
    }

async function handleAceEditorSubmit(json, jsonEditorElement,prefix) {
    currentPage = 1;
    let result = render(json, jsonEditorElement);
    let response_global = pyodide.globals.get('response')
    if (hasAttribute(response_global, "url") && (typeof response_global.url === "string")){
        debugger
        document.getElementById(`${prefix}_uri-encoded-output`).textContent= encodeURI(pyodide.globals.get('response').url)           
    } else{
        document.getElementById(`${prefix}_uri-encoded-output`).textContent= ""
    }
}

function initializeAceEditor(aceeditorEl){
    aceeditorEl.setTheme("ace/theme/monokai");
    // Remove leading whitespace/tabs from all lines
    let session=aceeditorEl.getSession()
    let acecontent=aceeditorEl.getValue();
    // The regex /^\s+/gm matches whitespace at the start of every line
    let newaceContent=acecontent.replace(/^\s+/gm,'');
    // Set value and move cursor to end (-1)
    aceeditorEl.setValue(newaceContent,-1);
}