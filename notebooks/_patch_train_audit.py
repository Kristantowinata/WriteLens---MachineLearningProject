import nbformat as nbf

NB = r"D:\binus\Semester 4\ML-Project\notebooks\03_model_training.ipynb"
nb = nbf.read(NB, as_version=4)

replacements = [
    (
        "- **Random Forest** dan **SVM** mepet, selisihnya cuma 0.005-0.01. Tapi GB tetep menang di metric F1 dan AUC.",
        "- **Random Forest** dan **SVM** mepet, selisihnya sama GB cuma 0.003-0.008 di F1. Tapi GB tetep menang tipis di F1 dan AUC.",
    ),
    (
        "- Gap CV vs test kecil di mana-mana (sekitar 0.01-0.02), nggak overfit.",
        "- Gap CV vs test kecil, kebanyakan di bawah 0.01. Yang paling gede cuma SVM di DAIGT (~0.018), masih dalam batas wajar. Nggak overfit.",
    ),
]

patched = 0
for c in nb.cells:
    if c.cell_type != 'markdown':
        continue
    for old, new in replacements:
        if old in c.source:
            c.source = c.source.replace(old, new)
            patched += 1

nbf.write(nb, NB)
print("Patched", patched, "lines.")
