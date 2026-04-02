import re
from pathlib import Path


def reset_glossary():
    file = "./blog/CR_API_Tutorials/glossary.qmd"
    with open(file, "wt") as f:
        f.write(
            "---\ntitle: Glossary for the Crossref API Tutorial Series\nengine: knitr\n---\n"
        )
    return None


def print_to_md(name, content):
    file = "./blog/CR_API_Tutorials/glossary.qmd"
    with open(file, "rt") as f:
        glossary_content = f.read()
    reconstructed_name = " ".join(name.split("-"))
    glossary_content += f"\n\n# {reconstructed_name} {{#{name.lower()}}} \n\n{content}"
    with open(file, "wt") as f:
        f.write(glossary_content)
    return None


def main():
    p = Path("./blog/CR_API_Tutorials/definition-modals")
    files = list(p.glob("*.qmd"))
    head_pattern = re.compile(r"```\n")
    tail_pattern = re.compile(
        r'\s*```{=html}\n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>\n      </div>\n    </div>\n  </div>\n</div>\n```'
    )
    reset_glossary()
    for file in files:
        with open(file, "rt") as f:
            content = f.read()
            head_pattern
            head_match = re.search(head_pattern, content)
            if not head_match:
                raise ValueError("No matching div head")
            content = content[head_match.span()[1] :]
            content = re.sub(tail_pattern, "", content)
            print_to_md(name=file.stem, content=content)
    return None


if __name__ == "__main__":
    main()
