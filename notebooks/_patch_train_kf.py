import nbformat as nbf

NB = r"D:\binus\Semester 4\ML-Project\notebooks\03_model_training.ipynb"
nb = nbf.read(NB, as_version=4)

old = "yang paling kuat adalah `syllable_per_word`, `hapax_ratio`, `bigram_repetition_rate`, `sentence_length_std`, dan `punctuation_density`"
new = "yang paling kuat adalah `syllable_per_word`, `sentence_length_std`, `comma_ratio`, `punctuation_density`, dan `bigram_repetition_rate`"

found = False
for c in nb.cells:
    if c.cell_type == 'markdown' and old in c.source:
        c.source = c.source.replace(old, new)
        found = True
        break

if not found:
    raise SystemExit("Snippet not found")

nbf.write(nb, NB)
print("Patched.")
