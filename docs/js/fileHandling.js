/**
 * Simple script to find any absolute paths in a single file uploaded.
 * Author: Christian N Sodano, cnsodanO@gmail.com 
 * Last Updated: 3/28/2025
 * Dependencies: 
 *  Testing done with Jest framework
 *  jQuery https://code.jquery.com/jquery-3.7.1.min.js 
 */
const REGEX = /(?:(?:'|")((?:[A-Z]:)(?:\/|\\|\/\/|\\\\)(?:[A-Za-z0-9_\-\.\/\\]+))(?:'|"))|(?:(?:'|")((?:\/|\\|\/\/|\\\\)(?:(?:H|h)ome|(?:U|u)sers?)(?:[A-Za-z0-9_\-\.\/\\]+))(?:'|"))/g    

if (window.jQuery) {
    console.log("jQuery loaded") // _testing dependency
}

// #region matchesAllowableFileExt
/* /Only showing limited functionality for this quarto website. The full code alerts when a filetype is not readable and tries to extract .zip files to make files readable when possible */
function matchesAllowableFileExt(queryFileName){
    try{ 
        function getFileExtension(filename) {
            if (typeof filename !== 'string') {
                return ''; // Handle cases where filename is not a string
            }
            const parts = filename.split('.');
            if (parts.length <= 1) {
                return ''; // Handle cases with no extension
            }
            return parts.pop(); // Returns characters after final "." (ext chars)
        }
        debugger;
        let result = false
        let extension = getFileExtension(queryFileName)
        let pattern = new RegExp(extension, "i") // Case insensitive
        const SIMPLE_FILE_EXTs_TO_TEST = [ "ipynb", "r", "rmd", "rtf", "txt", "md", "py", "m"]
        SIMPLE_FILE_EXTs_TO_TEST.map((element) => { 
            if (element.match(pattern)){result = true}
        })
        return result // No match
    } catch { 
        alert("An error occurred. This limited web version is not yet fully tested to the extent the full python codebase is. I apologize! Stay tuned for the full codebase release soon.\nThanks for checking it out!")
    }
}
// #endregion

// #region ThrowErrorMsg

function throwErrorMsg(){ 
    alert("An error occurred. This limited web version is not yet fully tested to the extent the full python codebase is. I apologize! Stay tuned for the full codebase release soon.\nThanks for checking it out!")
    return
}

// #endregion

// #region getAbsolutePaths

function getAbsolutePaths(query, regex) {
    /* For any abs path match (based on REGEX) in the file's text, find all the line numbers it is found at and return in a dictionary-style object. */
    let result = {}; //Obj, keys=string, values = array[number] (line #s)
    debugger;
    let matches = Array.from(query.matchAll(regex))
    let lineNum;
    if (matches.length === 0) {
        return null
    }
    for (let match of matches) {
        lineNum = getLineNumOfMatch(query, match)
        if (match[ 0 ] in result) { // if abs path mentioned >1 in file
            result[ match[ 0 ] ].push(lineNum)
        } else {
            result[ match[ 0 ] ] = [ lineNum ]
        }
    }
    return result
}

// #endregion

// #region getLineNumOfMatch

function getLineNumOfMatch(fileText, match) {
    /* While there are still linebreaks and the start index of the current linebreak is not > the start index of the match, add 1 to the linbreak counter. At end, add 1 to return the line number of the found abs path */
    let linebreaks = fileText.matchAll(/\n/g)
    if (linebreaks === null || linebreaks === undefined && fileText.length > 0) {
        throw new Exception("FileText is not empty but no newlines found")
    }
    if (linebreaks) {
        linebreak = linebreaks.next()
        let numLines = 0
        while (!linebreak.done) { // continue as long as there are more linebreaks
            if (linebreak.value.index > match.index) { break } // stop if past the match
            numLines += 1;
            linebreak = linebreaks.next()
        }
        return numLines + 1; // +1 to return the line of the match
    } else {
        return null
    }
}

// #endregion

// #region readFileAsText

function readFileAsText(file, reader) {
    /* This is required so that the browswer executing the js will wait for the file to be completely read before trying to search for paths, otherwise it will pass a null string to the path searching function */
    return new Promise((resolve, reject) => {
        
        reader.onload = (event) => { // Triggers when file read successfully
            resolve(event.target.result); // Returns the fileText stored  
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsText(file); // Now has fileText stored in reader.result property
    });
}

// #endregion

// #region main
$(document).ready(function () { 
    let $fileinput = $("#fileinput")
    $fileinput.on("change", async (event) => {
        let file = event.target.files[ 0 ] // _later consider >1 file
        if (!matchesAllowableFileExt(file.name)){
            alert("This file type is not supported on the limited web version, since I don't have time to reproduce the entire codebase in javascript. Stay tuned for an official release of the github which will handle more file types and manage unreadable files.\nTry again with a python, r, rmarkdown, matlab, or ipynb file, or text file (.rtf, .txt)\nThanks for checking it out!")
            return
        }
        let reader = new FileReader()
        try {
            const text = await readFileAsText(file, reader);
            if (text === null) {throwErrorMsg(); throw new Error("Text null error"); }
            let paths;
            try {
                debugger;
                paths = getAbsolutePaths(text, REGEX)
            } catch (error) {
                throwErrorMsg()
                throw new Error("Paths Error")
            }
            if (paths) {
                let msg = ""
                for (let [ path, lineNums ] of Object.entries(paths)) {
                    msg += `${path} is mentioned at line(s) ${lineNums.toString()}\n\n`
                }
                alert(msg)
                debugger;
            } else {
                alert(`No absolute paths found in ${file.name}`)
            }
        } catch (error) {
            throwErrorMsg()
            throw new Error("readFile error")
        }
    })
});

// #endregion