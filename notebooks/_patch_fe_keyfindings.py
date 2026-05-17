import nbformat as nbf

NB = r"D:\binus\Semester 4\ML-Project\notebooks\02_feature_engineering.ipynb"

new_content = """## Section 14. Key Findings

**Total fitur diekstrak.** 20 fitur stylometric dari sekitar 44 ribu essay DAIGT v2 plus 30 ribu sample MAGE (15k human + 15k AI), totalnya sekitar 74 ribu sampel teks.

**Seleksi fitur.** Pakai dua aturan: Cohen's d minimal 0.15 dan drop pasangan yang korelasinya > 0.85. Dari 20 fitur, 12 yang lolos seleksi, 6 di-drop karena effect-nya lemah, 2 di-drop karena redundant.

**Fitur paling kuat.** Top 5 berdasarkan Cohen's d: `syllable_per_word` (0.70), `function_word_ratio` (0.51), `transition_word_density` (0.50), `comma_ratio` (0.48), dan `flesch_reading_ease` (0.45). Kebanyakan dari kategori readability, word choice, dan punctuation. Ini masuk akal karena AI cenderung pakai kata yang lebih panjang/kompleks, lebih banyak transition words (however, therefore, dll), dan lebih banyak koma.

**Fitur yang ternyata lemah.** Yang nggak diduga: `avg_sentence_length` cuma dapet d=0.077, padahal awalnya dikira bakal jadi fitur kuat. Ternyata rata-rata panjang kalimat human dan AI cukup overlap. `exclamation_ratio` (0.018) dan `passive_voice_estimate` (0.020) juga hampir nggak ada bedanya antar kelas.

**Yang di-drop karena redundant.** `avg_word_length` (d=0.698) korelasinya tinggi sama `syllable_per_word` (d=0.701), jadi yang dipertahanin syllable karena d-nya lebih tinggi. Sama halnya `ttr` (d=0.301) redundant sama `hapax_ratio` (d=0.309).

**Catatan soal transition_word_density.** Fitur ini punya range yang mulai dari 0 di kedua kelas (banyak teks yang nggak punya transition words). Effect size-nya tinggi (0.50) tapi distribusinya sparse, jadi di app nanti visualisasinya mungkin kurang informatif. Tetap dipertahanin buat model tapi perlu dicatat sebagai limitasi.

**Range buat app.** Tiap fitur terpilih udah dihitung range tipikal human dan AI pakai percentile 15/85, plus scale min/max pakai percentile 2/98. Disimpan di `feature_ranges.json`, siap di-copy ke `backend/ml/`.
"""

nb = nbf.read(NB, as_version=4)
print("Total cells:", len(nb.cells))

target = None
for i, c in enumerate(nb.cells):
    if c.cell_type == 'markdown' and c.source.lstrip().startswith("## Section 14"):
        target = i
        break

if target is None:
    raise SystemExit("Section 14 markdown cell not found")

print("Found Section 14 at index", target)
nb.cells[target].source = new_content

nbf.write(nb, NB)
print("Patched.")
