source("renv/activate.R")
if (interactive() && Sys.getenv("TERM_PROGRAM") == "vscode") {
  if ("httpgd" %in% .packages(all.available = TRUE)) {
    options(vsc.rstudioapi = TRUE)
    options(vsc.use_httpgd = TRUE)
    options(vsc.plot = FALSE)
    options(device = function(...) {
      httpgd::hgd(silent = FALSE)
    })
  }
}
if (!"box" %in% loadedNamespaces()) {
  requireNamespace("box")
}

options(
  box.path = "R",
  box.autoreload = TRUE,
  box.verbose = TRUE
)

reload_modules <- function() {
  if ("box" %in% loadedNamespaces()) {
    box::reload()
  }
}
options(prompt = "R> ", continue = "+ ")
print("loaded .Rprofile")
