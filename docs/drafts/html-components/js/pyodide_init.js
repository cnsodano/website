let pyodide=null;
let micropip=null;
const pyodideReady=(async () => {
    pyodide=await loadPyodide();
    await pyodide.loadPackage("micropip");
    micropip=pyodide.pyimport("micropip")
    console.log("Pyodide and micropip ready");
    await micropip.install('crossrefapi');
    console.log("crossrefapi ready");
})();