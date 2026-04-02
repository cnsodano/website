// Source - https://stackoverflow.com/a/48431760
// Posted by Do Async, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-22, License - CC BY-SA 3.0

// Util function
function addFormatter(input,formatFn) {
    let oldValue=input.value;

    const handleInput=event => {
        const result=formatFn(input.value,oldValue,event);
        if(typeof result==='string') {
            input.value=result;
        }

        oldValue=input.value;
    }

    handleInput();
    input.addEventListener("input",handleInput);
}

// Example implementation
// HOF returning regex prefix formatter
function regexPrefix(regex,prefix) {
    return (newValue,oldValue) => regex.test(newValue)? newValue:(newValue? oldValue:prefix);
}