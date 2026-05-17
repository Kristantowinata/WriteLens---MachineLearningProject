"""Build and execute notebooks/01_eda.ipynb (revised: casual style + content fixes)."""
import nbformat as nbf
from nbformat.v4 import new_notebook, new_code_cell, new_markdown_cell
from nbconvert.preprocessors import ExecutePreprocessor
import os

NB_PATH = os.path.join(os.path.dirname(__file__), "01_eda.ipynb")

cells = []
def md(s): cells.append(new_markdown_cell(s))
def code(s): cells.append(new_code_cell(s))

md("""# WriteLens, Eksplorasi Data (EDA)

Notebook ini buat kenalan sama dua dataset yang bakal dipake: DAIGT v2 sama MAGE.
Tujuannya gampang: pahamin isinya, cek distribusi label, lihat panjang teks, dan bersihin yang kotor sebelum masuk feature engineering.

Output:
- Cleaned dataset di `data/processed/`
- Plot buat slide PPT di `data/processed/plots/`
""")

md("## Section 1. Setup")

code("""import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import re
import os
import warnings
warnings.filterwarnings('ignore')

PLOTS_DIR = "../data/processed/plots"
os.makedirs(PLOTS_DIR, exist_ok=True)
os.makedirs("../data/processed", exist_ok=True)

plt.style.use('dark_background')
plt.rcParams.update({
    'figure.facecolor': '#0E0E16',
    'axes.facecolor': '#14141E',
    'axes.edgecolor': '#2A2A3C',
    'axes.labelcolor': '#E8E8ED',
    'text.color': '#E8E8ED',
    'xtick.color': '#8888A0',
    'ytick.color': '#8888A0',
    'grid.color': '#1E1E2E',
    'font.family': 'sans-serif',
    'font.size': 11,
})

TEAL  = "#4ECDC4"
CORAL = "#F47C7C"
AMBER = "#F0C05A"
GREEN = "#5EE0A0"
MUTED = "#8888A0"

def savefig(name):
    plt.savefig(os.path.join(PLOTS_DIR, name), dpi=150, bbox_inches='tight', facecolor='#0E0E16')
""")

md("## Section 2. Load Data")

md("### DAIGT v2\nFilenya di repo namanya `train_v2_drcat_02.csv` (dari Kaggle). Kolom `text` sama `label` udah sesuai konvensi kita (0 = human, 1 = AI), jadi nggak perlu rename.")

code("""daigt = pd.read_csv("../data/raw/train_v2_drcat_02.csv")
print("Shape:", daigt.shape)
print("Columns:", list(daigt.columns))
print(daigt.dtypes)
print("Jumlah null:", daigt.isnull().sum().sum())
daigt.head(3)
""")

code("""for c in daigt.columns:
    print(c, "->", daigt[c].nunique(), "unique")

print()
print("Label counts DAIGT:")
print(daigt['label'].value_counts())
""")

md("### MAGE\nMAGE ada dua file (train + test), digabung dulu. Kolomnya namanya `src` bukan `source`, jadi di-rename. Label MAGE itu kebalikan: 0 = machine, 1 = human, jadi harus di-invert biar konsisten sama DAIGT (0 = human, 1 = AI).")

code("""mage_train = pd.read_csv("../data/raw/mage_train.csv")
mage_test  = pd.read_csv("../data/raw/mage_test.csv")
print("train:", mage_train.shape, " test:", mage_test.shape)

mage = pd.concat([mage_train, mage_test], ignore_index=True)
mage = mage.rename(columns={'src': 'source'})
print("MAGE gabung:", mage.shape)
print(mage.isnull().sum())

print("Sebelum invert:")
print(mage['label'].value_counts())

mage['label'] = 1 - mage['label']

print("Setelah invert (0=human, 1=AI):")
print(mage['label'].value_counts())
mage.head(3)
""")

md("### Verifikasi label MAGE\nKarena label-nya barusan di-invert, mending dicek dulu. Source yang ada kata 'human'-nya harusnya berlabel 0 sekarang.")

code("""cek = mage[mage['source'].str.contains('human', na=False)].head(5)
print(cek[['source', 'label']])
print()
print("Unique label di source ber-'human':", cek['label'].unique())
""")

md("## Section 3. Statistik Dasar")

md("Tambah kolom panjang teks: word count, char count, sentence count, rata-rata panjang kata.")

code("""daigt['word_count']     = daigt['text'].apply(lambda x: len(str(x).split()))
daigt['char_count']     = daigt['text'].apply(lambda x: len(str(x)))
daigt['sentence_count'] = daigt['text'].apply(lambda x: len([s for s in re.split(r'[.!?]+', str(x)) if s.strip()]))
daigt['avg_word_length'] = daigt['text'].apply(
    lambda x: np.mean([len(w) for w in re.findall(r"[A-Za-z']+", str(x))]) if re.findall(r"[A-Za-z']+", str(x)) else 0
)

mage['word_count']     = mage['text'].apply(lambda x: len(str(x).split()))
mage['char_count']     = mage['text'].apply(lambda x: len(str(x)))
mage['sentence_count'] = mage['text'].apply(lambda x: len([s for s in re.split(r'[.!?]+', str(x)) if s.strip()]))
mage['avg_word_length'] = mage['text'].apply(
    lambda x: np.mean([len(w) for w in re.findall(r"[A-Za-z']+", str(x))]) if re.findall(r"[A-Za-z']+", str(x)) else 0
)

daigt[['word_count','sentence_count','avg_word_length']].describe()
""")

md("Ringkasan per label, pake groupby aja biar simpel.")

code("""print("DAIGT v2")
print(daigt.groupby('label')[['word_count','sentence_count','avg_word_length','char_count']].describe().T)
""")

code("""print("MAGE")
print(mage.groupby('label')[['word_count','sentence_count','avg_word_length','char_count']].describe().T)
""")

md("## Section 4. Distribusi Label\nIni penting buat slide Dataset Description, nunjukin balance / imbalance class-nya.")

code("""fig, axes = plt.subplots(1, 2, figsize=(12, 5))

counts_daigt = daigt['label'].value_counts().sort_index()
axes[0].bar(['Human', 'AI'], [counts_daigt[0], counts_daigt[1]], color=[GREEN, CORAL])
axes[0].set_title("DAIGT v2")
axes[0].set_ylabel("Count")
axes[0].grid(axis='y', alpha=0.2)
for i, v in enumerate([counts_daigt[0], counts_daigt[1]]):
    axes[0].text(i, v, str(v), ha='center', va='bottom')

counts_mage = mage['label'].value_counts().sort_index()
axes[1].bar(['Human', 'AI'], [counts_mage[0], counts_mage[1]], color=[GREEN, CORAL])
axes[1].set_title("MAGE")
axes[1].set_ylabel("Count")
axes[1].grid(axis='y', alpha=0.2)
for i, v in enumerate([counts_mage[0], counts_mage[1]]):
    axes[1].text(i, v, str(v), ha='center', va='bottom')

fig.suptitle("Label Distribution", fontsize=15)
plt.tight_layout()
savefig("label_distribution.png")
plt.show()
""")

md("## Section 5. Panjang Teks")

md("Histogram word count. Human (hijau) vs AI (coral), garis putus-putus = median.")

code("""fig, axes = plt.subplots(1, 2, figsize=(13, 5))
XCLIP = 2000

for ax, df, title in [(axes[0], daigt, "DAIGT v2"), (axes[1], mage, "MAGE")]:
    h = df.loc[df['label']==0, 'word_count']
    a = df.loc[df['label']==1, 'word_count']
    bins = np.linspace(0, XCLIP, 60)
    ax.hist(h.clip(upper=XCLIP), bins=bins, color=GREEN, alpha=0.6, label='Human')
    ax.hist(a.clip(upper=XCLIP), bins=bins, color=CORAL, alpha=0.6, label='AI')
    ax.axvline(h.median(), color=GREEN, ls='--')
    ax.axvline(a.median(), color=CORAL, ls='--')
    ax.set_title(title)
    ax.set_xlabel("Word count")
    ax.legend()
    ax.grid(alpha=0.15)

fig.suptitle("Word Count Distribution (dipotong di 2000)", fontsize=15)
plt.tight_layout()
savefig("word_count_distribution.png")
plt.show()
""")

md("Box plot, biar spread sama outlier-nya lebih kelihatan.")

code("""fig, axes = plt.subplots(1, 2, figsize=(12, 5))

d1 = [daigt.loc[daigt['label']==0,'word_count'].clip(upper=3000),
      daigt.loc[daigt['label']==1,'word_count'].clip(upper=3000)]
bp1 = axes[0].boxplot(d1, labels=['Human','AI'], patch_artist=True)
for patch, c in zip(bp1['boxes'], [GREEN, CORAL]):
    patch.set_facecolor(c); patch.set_alpha(0.7)
axes[0].set_title("DAIGT v2")
axes[0].set_ylabel("Word count")

d2 = [mage.loc[mage['label']==0,'word_count'].clip(upper=3000),
      mage.loc[mage['label']==1,'word_count'].clip(upper=3000)]
bp2 = axes[1].boxplot(d2, labels=['Human','AI'], patch_artist=True)
for patch, c in zip(bp2['boxes'], [GREEN, CORAL]):
    patch.set_facecolor(c); patch.set_alpha(0.7)
axes[1].set_title("MAGE")

fig.suptitle("Word Count Boxplot", fontsize=15)
plt.tight_layout()
savefig("word_count_boxplot.png")
plt.show()
""")

md("Sama tapi buat sentence count.")

code("""fig, axes = plt.subplots(1, 2, figsize=(13, 5))
XCLIP = 120

for ax, df, title in [(axes[0], daigt, "DAIGT v2"), (axes[1], mage, "MAGE")]:
    h = df.loc[df['label']==0, 'sentence_count']
    a = df.loc[df['label']==1, 'sentence_count']
    bins = np.linspace(0, XCLIP, 50)
    ax.hist(h.clip(upper=XCLIP), bins=bins, color=GREEN, alpha=0.6, label='Human')
    ax.hist(a.clip(upper=XCLIP), bins=bins, color=CORAL, alpha=0.6, label='AI')
    ax.axvline(h.median(), color=GREEN, ls='--')
    ax.axvline(a.median(), color=CORAL, ls='--')
    ax.set_title(title)
    ax.set_xlabel("Sentence count")
    ax.legend()
    ax.grid(alpha=0.15)

fig.suptitle("Sentence Count Distribution", fontsize=15)
plt.tight_layout()
savefig("sentence_count_distribution.png")
plt.show()
""")

md("## Section 6. Source MAGE\nMAGE ngumpulin teks dari macem-macem tempat (Reddit, Yelp, QA, dll) dan dari macem-macem LLM. Bagian ini buat lihat variasinya.")

code("""src_counts = mage['source'].value_counts()
print("Total unique source:", len(src_counts))
print(src_counts.head(20))

def is_human_src(s):
    return 'human' in str(s).lower()

top_n = min(25, len(src_counts))
top = src_counts.head(top_n).iloc[::-1]
colors = [GREEN if is_human_src(s) else CORAL for s in top.index]

fig, ax = plt.subplots(figsize=(11, max(6, top_n*0.32)))
ax.barh(top.index, top.values, color=colors)
ax.set_xlabel("Count")
ax.set_title("MAGE Top Sources (hijau = human, coral = AI)")
ax.grid(axis='x', alpha=0.15)
for i, v in enumerate(top.values):
    ax.text(v, i, " " + str(v), va='center')
plt.tight_layout()
savefig("mage_source_distribution.png")
plt.show()
""")

md("Word count per source. Apakah model LLM tertentu cenderung nulis lebih panjang/pendek?")

code("""top_sources = mage['source'].value_counts().head(15).index.tolist()
sub = mage[mage['source'].isin(top_sources)].copy()
sub['wc_clip'] = sub['word_count'].clip(upper=2000)

order = sub.groupby('source')['wc_clip'].median().sort_values().index.tolist()
data = [sub.loc[sub['source']==s, 'wc_clip'].values for s in order]
colors = [GREEN if is_human_src(s) else CORAL for s in order]

fig, ax = plt.subplots(figsize=(12, max(6, len(order)*0.4)))
bp = ax.boxplot(data, labels=order, vert=False, patch_artist=True)
for patch, c in zip(bp['boxes'], colors):
    patch.set_facecolor(c); patch.set_alpha(0.7)
ax.set_xlabel("Word count (max 2000)")
ax.set_title("MAGE: Word count per source (top 15)")
ax.grid(axis='x', alpha=0.15)
plt.tight_layout()
savefig("mage_wordcount_by_source.png")
plt.show()
""")

md("## Section 7. Contoh Teks\nBuka beberapa sample biar bisa lihat langsung beda gaya tulisan human vs AI.")

code("""human_samp = daigt[daigt['label']==0].sample(3, random_state=42)
ai_samp    = daigt[daigt['label']==1].sample(3, random_state=42)

for i, (_, row) in enumerate(human_samp.iterrows(), 1):
    text = str(row['text'])[:500].replace('\\n', ' ')
    print("=== HUMAN", i, "===")
    print(text + ("..." if len(str(row['text'])) > 500 else ""))
    print("Words:", row['word_count'], "Sentences:", row['sentence_count'])
    print()

for i, (_, row) in enumerate(ai_samp.iterrows(), 1):
    text = str(row['text'])[:500].replace('\\n', ' ')
    print("=== AI", i, "===")
    print(text + ("..." if len(str(row['text'])) > 500 else ""))
    print("Words:", row['word_count'], "Sentences:", row['sentence_count'])
    print()
""")

md("## Section 8. Cek Kualitas Data")

md("Duplikat dulu.")

code("""daigt_dupes = daigt['text'].duplicated().sum()
mage_dupes  = mage['text'].duplicated().sum()
print("DAIGT duplikat:", daigt_dupes)
print("MAGE duplikat:", mage_dupes)
""")

md("### Cek teks pendek/panjang\nTeks di bawah 20 kata terlalu pendek buat analisis, yang di atas 5000 kata outlier. Kita filter dua-duanya.")

code("""short_daigt = (daigt['word_count'] < 20).sum()
long_daigt  = (daigt['word_count'] > 5000).sum()
short_mage  = (mage['word_count']  < 20).sum()
long_mage   = (mage['word_count']  > 5000).sum()

print("DAIGT pendek:", short_daigt, " panjang:", long_daigt)
print("MAGE pendek:", short_mage, " panjang:", long_mage)
""")

md("Cek null / string kosong.")

code("""print("DAIGT null:", daigt['text'].isnull().sum(),
      " kosong:", (daigt['text'].fillna('').str.strip().str.len()==0).sum())
print("MAGE null:", mage['text'].isnull().sum(),
      " kosong:", (mage['text'].fillna('').str.strip().str.len()==0).sum())
""")

md("Ringkas semua angka di atas.")

code("""print("DAIGT v2")
print("Total:", len(daigt))
print("Duplikat:", daigt_dupes)
print("Terlalu pendek:", short_daigt)
print("Terlalu panjang:", long_daigt)
print()
print("MAGE")
print("Total:", len(mage))
print("Duplikat:", mage_dupes)
print("Terlalu pendek:", short_mage)
print("Terlalu panjang:", long_mage)
""")

md("## Section 9. Cleaning\nLangkah-langkahnya: buang null/kosong, buang duplikat, filter panjang teks ke rentang 20 sampai 5000 kata. Dipakai ke dua dataset, jadi dibungkus function.")

code("""def clean_dataset(df, name):
    n0 = len(df)
    df = df.dropna(subset=['text']).copy()
    df = df[df['text'].str.strip().str.len() > 0]
    df = df.drop_duplicates(subset=['text'])
    df = df[df['word_count'] >= 20]
    df = df[df['word_count'] <= 5000]
    n1 = len(df)
    print(name, ":", n0, "->", n1, " (buang", n0-n1, ")")
    return df.reset_index(drop=True)

daigt_clean = clean_dataset(daigt, "DAIGT v2")
mage_clean  = clean_dataset(mage,  "MAGE")
""")

md("### Cross-dataset duplicate\nGabungin dulu sementara, terus cek apakah ada teks yang muncul di kedua dataset.")

code("""tmp = pd.concat([daigt_clean[['text']], mage_clean[['text']]], ignore_index=True)
combined_dupes = tmp['text'].duplicated().sum()
internal = daigt_clean['text'].duplicated().sum() + mage_clean['text'].duplicated().sum()
cross = combined_dupes - internal
print("Total duplikat di gabungan:", combined_dupes)
print("Duplikat dalam masing-masing:", internal)
print("Duplikat antar dataset:", cross)
""")

md("Plot ulang label distribution setelah cleaning, biar yakin balance-nya nggak berubah drastis.")

code("""fig, axes = plt.subplots(1, 2, figsize=(12, 5))

c1 = daigt_clean['label'].value_counts().sort_index()
axes[0].bar(['Human','AI'], [c1[0], c1[1]], color=[GREEN, CORAL])
axes[0].set_title("DAIGT v2 (clean)")
for i, v in enumerate([c1[0], c1[1]]):
    axes[0].text(i, v, str(v), ha='center', va='bottom')

c2 = mage_clean['label'].value_counts().sort_index()
axes[1].bar(['Human','AI'], [c2[0], c2[1]], color=[GREEN, CORAL])
axes[1].set_title("MAGE (clean)")
for i, v in enumerate([c2[0], c2[1]]):
    axes[1].text(i, v, str(v), ha='center', va='bottom')

fig.suptitle("Label Distribution setelah cleaning", fontsize=15)
plt.tight_layout()
savefig("label_distribution_clean.png")
plt.show()
""")

md("## Section 10. Perbandingan Dataset")

code("""combined = pd.concat([daigt_clean, mage_clean], ignore_index=True)

rows = []
for name, df in [("DAIGT v2", daigt_clean), ("MAGE", mage_clean), ("Combined", combined)]:
    total = len(df)
    h = int((df['label']==0).sum())
    a = int((df['label']==1).sum())
    rows.append({
        "Dataset": name,
        "Total": total,
        "Human": h,
        "AI": a,
        "Balance H/AI": "{:.1f}% / {:.1f}%".format(h/total*100, a/total*100),
        "Median words": int(df['word_count'].median()),
    })

comp = pd.DataFrame(rows).set_index("Dataset")
print(comp)
""")

md("### Class imbalance\nDi gabungan, ratio human:AI ternyata cukup miring (sekitar 35% human, 65% AI). Ini perlu di-flag dan ditanganin di tahap training nanti. Beberapa opsi:\n- Stratified split waktu train/val/test\n- `class_weight='balanced'` di model sklearn\n- Undersample AI biar seimbang sama human\n- Atau pake DAIGT v2 sendirian dulu yang lebih balanced\n\nKeputusan finalnya nanti pas notebook training, tapi disebut di sini biar kebawa konteksnya.")

code("""h = int((combined['label']==0).sum())
a = int((combined['label']==1).sum())
total = h + a
print("Combined human:", h, "({:.1f}%)".format(h/total*100))
print("Combined AI:   ", a, "({:.1f}%)".format(a/total*100))
print("Ratio AI/Human: {:.2f}".format(a/h))
""")

md("### Domain mismatch\nDAIGT v2 isinya essay mahasiswa (formal, lebih panjang). MAGE isinya teks Reddit, Yelp, QA (lebih pendek, informal). Median word count-nya beda jauh, jadi gabungin mentah-mentah mungkin bikin model belajar 'pendek = MAGE = mostly AI' bukan ciri AI yang sebenernya.")

code("""print("Median word count per dataset:")
print("  DAIGT human:", int(daigt_clean.loc[daigt_clean['label']==0,'word_count'].median()))
print("  DAIGT AI:   ", int(daigt_clean.loc[daigt_clean['label']==1,'word_count'].median()))
print("  MAGE human: ", int(mage_clean.loc[mage_clean['label']==0,'word_count'].median()))
print("  MAGE AI:    ", int(mage_clean.loc[mage_clean['label']==1,'word_count'].median()))
print()
print("Pertimbangan: kalau combining langsung, sinyalnya bisa ke-bias sama domain bukan ke gaya AI vs human.")
print("Opsi yang masuk akal: DAIGT v2 sebagai primary, MAGE buat augmentasi dengan sampling proporsional.")
""")

md("Histogram gabungan, sekedar lihat overall picture.")

code("""fig, ax = plt.subplots(figsize=(11, 5))
XCLIP = 2000
h = combined.loc[combined['label']==0,'word_count'].clip(upper=XCLIP)
a = combined.loc[combined['label']==1,'word_count'].clip(upper=XCLIP)
bins = np.linspace(0, XCLIP, 70)
ax.hist(h, bins=bins, color=GREEN, alpha=0.6, label="Human (n=" + str(len(h)) + ")")
ax.hist(a, bins=bins, color=CORAL, alpha=0.6, label="AI (n=" + str(len(a)) + ")")
ax.axvline(h.median(), color=GREEN, ls='--')
ax.axvline(a.median(), color=CORAL, ls='--')
ax.set_xlim(0, XCLIP)
ax.set_xlabel("Word count")
ax.set_title("Combined Word Count Distribution")
ax.legend()
ax.grid(alpha=0.15)
plt.tight_layout()
savefig("combined_word_count_distribution.png")
plt.show()
""")

md("## Section 11. Simpan Hasil")

code("""cols_daigt = [c for c in ['text','label','source','prompt_name'] if c in daigt_clean.columns]
cols_mage  = [c for c in ['text','label','source']                  if c in mage_clean.columns]

daigt_out = daigt_clean[cols_daigt].copy()
mage_out  = mage_clean[cols_mage].copy()
daigt_out['dataset'] = 'daigt_v2'
mage_out['dataset']  = 'mage'

daigt_out.to_csv("../data/processed/daigt_v2_clean.csv", index=False)
mage_out.to_csv("../data/processed/mage_clean.csv", index=False)

all_data = pd.concat([daigt_out, mage_out], ignore_index=True)
all_data.to_csv("../data/processed/combined_clean.csv", index=False)

print("Saved:")
print(" daigt_v2_clean.csv :", len(daigt_out))
print(" mage_clean.csv     :", len(mage_out))
print(" combined_clean.csv :", len(all_data))
""")

md("""## Section 12. Key Findings

**Ukuran data.** DAIGT v2 sekitar 44 ribu essay, MAGE setelah train+test sekitar 360 ribu teks. Setelah cleaning, gabungan tetap ratusan ribu sampel, cukup banyak buat training.

**Konvensi label.** DAIGT v2 udah pakai 0 = human, 1 = AI. MAGE awalnya kebalikan, jadi di-invert. Setelah di-spot-check ke source yang ada kata 'human'-nya, label-nya udah bener.

**Class imbalance (perlu dicatat).** Di gabungan, sekitar 35% human dan 65% AI. Ratio AI ke human kira-kira 1.8x. Buat training nanti kita harus pakai stratified split, plus salah satu dari `class_weight='balanced'` atau undersampling, biar model nggak bias ke AI. Alternatif lain pakai DAIGT v2 sendiri yang lebih balanced.

**Domain mismatch (yang menarik).** DAIGT v2 itu domain essay mahasiswa, panjang, formal. MAGE domain media sosial dan QA, pendek, casual. Median word count beda jauh. Risiko: model bisa belajar shortcut bahwa 'teks pendek = MAGE = mostly AI', bukan ciri tulisan AI yang asli. Solusinya bisa: pakai DAIGT v2 sebagai dataset utama buat ngajarin gaya, dan MAGE buat augmentasi dengan sampling yang nyamain panjang teks.

**Panjang teks.** Tulisan human di MAGE biasanya lebih variatif (ada yang pendek banget, ada yang panjang), sementara AI cenderung di range yang lebih konsisten. Di DAIGT v2, dua-duanya panjang-panjang karena emang format essay.

**Kualitas data.** Cleaning buang null, kosong, duplikat, teks di luar rentang 20 sampai 5000 kata. Cross-dataset duplicate juga dicek. Persentase yang dibuang relatif kecil dibanding total dan balance kelas nggak berubah signifikan.

**Sumber MAGE.** Banyak banget LLM yang dipakai di MAGE (lihat plot source distribution), ini bagus buat generalisasi model deteksi.

### Next Step
- Notebook `02_features.ipynb` buat ekstrak fitur stylometric
- Cek fitur mana yang paling diskriminatif
- Putuskan: pakai DAIGT only, MAGE only, atau combined dengan strategi sampling tertentu
""")

nb = new_notebook(cells=cells)
nb.metadata['kernelspec'] = {'display_name': 'Python 3', 'language': 'python', 'name': 'python3'}
nb.metadata['language_info'] = {'name': 'python'}

with open(NB_PATH, 'w', encoding='utf-8') as f:
    nbf.write(nb, f)

print("Wrote", NB_PATH, " cells:", len(cells))

print("Executing...")
ep = ExecutePreprocessor(timeout=900, kernel_name='python3')
ep.preprocess(nb, {'metadata': {'path': os.path.dirname(__file__)}})

with open(NB_PATH, 'w', encoding='utf-8') as f:
    nbf.write(nb, f)
print("Done.")
