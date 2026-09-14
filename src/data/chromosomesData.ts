export interface ChromosomeInfo {
  id: string;
  number: string;
  name: string;
  type: "Autosome" | "Sex Chromosome" | "Mitochondrial";
  morphology: "Metacentric" | "Submetacentric" | "Acrocentric" | "Circular";
  lengthBp: string;
  estimatedGenes: string;
  percentageOfGenome: string;
  keyGenes: { symbol: string; name: string; description: string }[];
  associatedConditions: string[];
  scientificOverview: string;
  ncbiLink: string;
  ensemblLink: string;
  wikiLink: string;
}

export const HUMAN_CHROMOSOMES: ChromosomeInfo[] = [
  {
    id: "chr1",
    number: "1",
    name: "Chromosome 1",
    type: "Autosome",
    morphology: "Metacentric",
    lengthBp: "~249 Million bp",
    estimatedGenes: "~2,050 genes",
    percentageOfGenome: "~8%",
    keyGenes: [
      { symbol: "MUTYH", name: "MYH Glycosylase", description: "DNA base excision repair; linked to colorectal adenomatous polyposis." },
      { symbol: "GBA", name: "Glucocerebrosidase", description: "Lipid metabolism; mutations cause Gaucher disease and Parkinson's risk." },
      { symbol: "ARID1A", name: "SWI/SNF Subunit", description: "Chromatin remodeling tumor suppressor frequently mutated in cancers." },
      { symbol: "USH2A", name: "Usherin", description: "Crucial for inner ear hair cells and retinal photoreceptor development." }
    ],
    associatedConditions: [
      "Gaucher Disease",
      "Usher Syndrome Type II",
      "Parkinson's Disease Susceptibility",
      "1p36 Deletion Syndrome",
      "Charcot-Marie-Tooth Disease Type 1B"
    ],
    scientificOverview: "Chromosome 1 is the largest human chromosome, containing approximately 8% of the total human DNA. It has the highest gene density among the larger autosomes and houses numerous critical tumor suppressor and metabolic genes.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+1[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=1",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_1"
  },
  {
    id: "chr2",
    number: "2",
    name: "Chromosome 2",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~243 Million bp",
    estimatedGenes: "~1,300 genes",
    percentageOfGenome: "~8%",
    keyGenes: [
      { symbol: "MSH2", name: "DNA Mismatch Repair Protein 2", description: "Critical for genome stability; mutations lead to Lynch syndrome." },
      { symbol: "TPO", name: "Thyroid Peroxidase", description: "Thyroid hormone biosynthesis; causes congenital hypothyroidism." },
      { symbol: "SCN1A", name: "Voltage-Gated Sodium Channel", description: "Neuronal action potentials; linked to Dravet syndrome." }
    ],
    associatedConditions: [
      "Lynch Syndrome (Hereditary Non-Polyposis Colorectal Cancer)",
      "Dravet Syndrome & Severe Myoclonic Epilepsy",
      "Congenital Hypothyroidism",
      "2q37 Deletion Syndrome"
    ],
    scientificOverview: "Chromosome 2 is the second largest human chromosome. Evolutionarily, it is famous for being the result of an end-to-end ancestral telomeric fusion of two ancestral ape chromosomes, uniquely evident in human telomeric repeats at 2q13.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+2[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=2",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_2"
  },
  {
    id: "chr3",
    number: "3",
    name: "Chromosome 3",
    type: "Autosome",
    morphology: "Metacentric",
    lengthBp: "~198 Million bp",
    estimatedGenes: "~1,100 genes",
    percentageOfGenome: "~6.5%",
    keyGenes: [
      { symbol: "VHL", name: "Von Hippel-Lindau Tumor Suppressor", description: "Degrades hypoxia-inducible factor (HIF); causes VHL syndrome & renal cell carcinoma." },
      { symbol: "MLH1", name: "DNA Mismatch Repair Protein 1", description: "DNA mismatch repair; frequently linked to colorectal malignancies." },
      { symbol: "RHO", name: "Rhodopsin", description: "Visual photopigment in rod cells; causes Retinitis Pigmentosa." }
    ],
    associatedConditions: [
      "Von Hippel-Lindau Disease",
      "Retinitis Pigmentosa Type 4",
      "3p Deletion Syndrome",
      "Hereditary Nonpolyposis Colorectal Cancer Type 2"
    ],
    scientificOverview: "Chromosome 3 spans nearly 200 million base pairs and carries critical loci involved in cellular oxygen sensing (VHL) and genomic mismatch repair (MLH1).",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+3[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=3",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_3"
  },
  {
    id: "chr4",
    number: "4",
    name: "Chromosome 4",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~191 Million bp",
    estimatedGenes: "~750-1,000 genes",
    percentageOfGenome: "~6%",
    keyGenes: [
      { symbol: "HTT", name: "Huntingtin", description: "Trinucleotide CAG repeat expansion causes fatal neurodegenerative Huntington's disease." },
      { symbol: "FGFR3", name: "Fibroblast Growth Factor Receptor 3", description: "Negative regulator of bone growth; mutations cause Achondroplasia (dwarfism)." },
      { symbol: "PDGFRA", name: "Platelet Derived Growth Factor Receptor Alpha", description: "Tyrosine kinase receptor implicated in gastrointestinal stromal tumors." }
    ],
    associatedConditions: [
      "Huntington's Disease",
      "Achondroplasia (Common Dwarfism)",
      "Wolf-Hirschhorn Syndrome (4p- Deletion)",
      "Polycystic Kidney Disease Type 2 (PKD2)"
    ],
    scientificOverview: "Chromosome 4 represents approximately 6% of total DNA. It is internationally renowned for housing the HTT gene responsible for Huntington's disease and the FGFR3 gene causing achondroplasia.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+4[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=4",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_4"
  },
  {
    id: "chr5",
    number: "5",
    name: "Chromosome 5",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~181 Million bp",
    estimatedGenes: "~900 genes",
    percentageOfGenome: "~6%",
    keyGenes: [
      { symbol: "APC", name: "Adenomatous Polyposis Coli", description: "Wnt signaling regulator; mutations cause Familial Adenomatous Polyposis (FAP)." },
      { symbol: "SMN1", name: "Survival of Motor Neuron 1", description: "Spinal cord motor neuron maintenance; deletion causes Spinal Muscular Atrophy (SMA)." },
      { symbol: "TERT", name: "Telomerase Reverse Transcriptase", description: "Adds telomeric repeats to chromosome ends; critical in cellular immortality and aging." }
    ],
    associatedConditions: [
      "Cri-du-Chat Syndrome (5p Deletion)",
      "Spinal Muscular Atrophy (SMA Types 1-4)",
      "Familial Adenomatous Polyposis (FAP Colorectal Cancer)",
      "Treacher Collins Syndrome"
    ],
    scientificOverview: "Chromosome 5 carries the telomerase catalytic subunit (TERT), the APC colon cancer suppressor, and SMN1 (targeted by modern breakthrough gene therapies like Zolgensma and Spinraza).",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+5[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=5",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_5"
  },
  {
    id: "chr6",
    number: "6",
    name: "Chromosome 6",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~171 Million bp",
    estimatedGenes: "~1,100 genes",
    percentageOfGenome: "~5.5%",
    keyGenes: [
      { symbol: "HLA Cluster", name: "Major Histocompatibility Complex (MHC)", description: "Controls human immune self-recognition, organ transplant rejection, and autoimmune diseases." },
      { symbol: "HFE", name: "Hemochromatosis Protein", description: "Regulates iron absorption in intestines; causes iron overload disorder." },
      { symbol: "PARK2 / PRKN", name: "Parkin RBR E3 Ubiquitin Ligase", description: "Mitochondrial quality control; causes autosomal recessive juvenile Parkinson's." }
    ],
    associatedConditions: [
      "Autoimmune Disorders (Type 1 Diabetes, Celiac, Rheumatoid Arthritis via HLA)",
      "Hereditary Hemochromatosis",
      "Juvenile Parkinson's Disease",
      "6q Deletion Syndrome"
    ],
    scientificOverview: "Chromosome 6 houses the most polymorphic and immune-critical region of the human genome: the Major Histocompatibility Complex (MHC / HLA), which determines immune recognition, pathogen response, and graft compatibility.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+6[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=6",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_6"
  },
  {
    id: "chr7",
    number: "7",
    name: "Chromosome 7",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~159 Million bp",
    estimatedGenes: "~1,000 genes",
    percentageOfGenome: "~5%",
    keyGenes: [
      { symbol: "CFTR", name: "Cystic Fibrosis Transmembrane Regulator", description: "Chloride channel across epithelial membranes; DeltaF508 mutation causes Cystic Fibrosis." },
      { symbol: "EGFR", name: "Epidermal Growth Factor Receptor", description: "Cell proliferation receptor tyrosine kinase; prime target for oncology immunotherapy." },
      { symbol: "ELN", name: "Elastin", description: "Elastic fiber in blood vessels and skin; microdeletion causes Williams-Beuren syndrome." }
    ],
    associatedConditions: [
      "Cystic Fibrosis (CFTR mutations)",
      "Williams-Beuren Syndrome (7q11.23 microdeletion)",
      "Non-Small Cell Lung Cancer (EGFR drivers)",
      "Silver-Russell Syndrome"
    ],
    scientificOverview: "Chromosome 7 contains the famous CFTR gene discovered in 1989 that revolutionized genetic medicine for cystic fibrosis, alongside crucial oncogenes like EGFR.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+7[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=7",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_7"
  },
  {
    id: "chr8",
    number: "8",
    name: "Chromosome 8",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~145 Million bp",
    estimatedGenes: "~700 genes",
    percentageOfGenome: "~4.5%",
    keyGenes: [
      { symbol: "MYC", name: "MYC Proto-Oncogene", description: "Master transcription factor driving cell cycle; activated in Burkitt lymphoma by t(8;14) translocation." },
      { symbol: "WRN", name: "Werner Syndrome RecQ Helicase", description: "DNA double-strand break repair; mutations cause premature aging (Werner syndrome)." },
      { symbol: "FGFR1", name: "Fibroblast Growth Factor Receptor 1", description: "Skeletal development and Kallmann syndrome." }
    ],
    associatedConditions: [
      "Burkitt Lymphoma (t(8;14) MYC translocation)",
      "Werner Syndrome (Adult Progeria / Rapid Premature Aging)",
      "Recombinant 8 Syndrome",
      "Kallmann Syndrome Type 2"
    ],
    scientificOverview: "Chromosome 8 has two distinct evolutionary regions: a gene-poor desert region and dense clusters including the MYC proto-oncogene and WRN progeria helicase.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+8[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=8",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_8"
  },
  {
    id: "chr9",
    number: "9",
    name: "Chromosome 9",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~138 Million bp",
    estimatedGenes: "~800 genes",
    percentageOfGenome: "~4.5%",
    keyGenes: [
      { symbol: "ABL1", name: "ABL Proto-Oncogene Tyrosine Kinase", description: "Forms BCR-ABL1 Philadelphia Chromosome t(9;22) driving Chronic Myeloid Leukemia (CML)." },
      { symbol: "CDKN2A", name: "p16INK4a / p14ARF Tumor Suppressor", description: "Cell cycle inhibitor; linked to melanoma and pancreatic adenocarcinoma." },
      { symbol: "ABO", name: "ABO Blood Group Glycosyltransferase", description: "Determines A, B, AB, and O human blood types." }
    ],
    associatedConditions: [
      "Philadelphia Chromosome t(9;22) Chronic Myeloid Leukemia (CML)",
      "Familial Cutaneous Melanoma",
      "ABO Blood Incompatibilities",
      "Gorlin Syndrome (Nevoid Basal Cell Carcinoma)"
    ],
    scientificOverview: "Chromosome 9 is celebrated in hematology and medicine for the BCR-ABL1 translocation that formed the Philadelphia chromosome, treated by targeted tyrosine kinase inhibitors like Imatinib (Gleevec).",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+9[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=9",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_9"
  },
  {
    id: "chr10",
    number: "10",
    name: "Chromosome 10",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~133 Million bp",
    estimatedGenes: "~800 genes",
    percentageOfGenome: "~4%",
    keyGenes: [
      { symbol: "PTEN", name: "Phosphatase and Tensin Homolog", description: "Master negative regulator of PI3K/Akt pathway; lost in glioblastoma and prostate cancer." },
      { symbol: "RET", name: "RET Proto-Oncogene", description: "Receptor tyrosine kinase; mutated in Multiple Endocrine Neoplasia (MEN 2A/2B)." },
      { symbol: "FGFR2", name: "Fibroblast Growth Factor Receptor 2", description: "Craniosynostosis syndromes (Apert, Pfeiffer, Crouzon)." }
    ],
    associatedConditions: [
      "Cowden Syndrome (PTEN hamartoma tumor syndrome)",
      "Multiple Endocrine Neoplasia Type 2 (MEN2)",
      "Hirschsprung Disease (RET deficiency)",
      "Apert & Crouzon Syndromes"
    ],
    scientificOverview: "Chromosome 10 contains PTEN, one of the most frequently mutated tumor suppressor genes in human oncology, alongside the RET receptor tyrosine kinase.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+10[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=10",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_10"
  },
  {
    id: "chr11",
    number: "11",
    name: "Chromosome 11",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~135 Million bp",
    estimatedGenes: "~1,300 genes",
    percentageOfGenome: "~4.5%",
    keyGenes: [
      { symbol: "HBB", name: "Hemoglobin Subunit Beta", description: "Beta-globin chain; point mutation Glu6Val causes Sickle Cell Disease; causes Beta-Thalassemia." },
      { symbol: "INS", name: "Insulin", description: "Master hormone regulating glucose metabolism; synthesis defect leads to neonatal diabetes." },
      { symbol: "WT1", name: "Wilms Tumor 1", description: "Kidney development transcription factor; causes Wilms nephroblastoma." }
    ],
    associatedConditions: [
      "Sickle Cell Anemia (HBB HbS mutation)",
      "Beta-Thalassemia Major & Intermedia",
      "Beckwith-Wiedemann Syndrome (11p15.5 imprinting)",
      "Wilms Tumor (Nephroblastoma)",
      "WAGR Syndrome (11p13 deletion)"
    ],
    scientificOverview: "Chromosome 11 is one of the most gene-rich chromosomes in humans. It harbors the Beta-globin (HBB) gene responsible for sickle cell anemia and beta-thalassemia, as well as human Insulin (INS).",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+11[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=11",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_11"
  },
  {
    id: "chr12",
    number: "12",
    name: "Chromosome 12",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~133 Million bp",
    estimatedGenes: "~1,050 genes",
    percentageOfGenome: "~4.5%",
    keyGenes: [
      { symbol: "KRAS", name: "KRAS Proto-Oncogene GTPase", description: "Signaling switch in MAPK pathway; mutated in 90% of pancreatic and 40% of colorectal cancers." },
      { symbol: "PAH", name: "Phenylalanine Hydroxylase", description: "Converts phenylalanine to tyrosine; deficiency causes Phenylketonuria (PKU)." },
      { symbol: "COL2A1", name: "Collagen Type II Alpha 1", description: "Cartilage structural collagen; mutations cause Stickler and Kniest dysplasia." }
    ],
    associatedConditions: [
      "Phenylketonuria (PKU Metabolic Disorder)",
      "KRAS-driven Pancreatic & Colorectal Cancers",
      "Noonan Syndrome (PTPN11 / KRAS)",
      "Stickler Syndrome Type 1"
    ],
    scientificOverview: "Chromosome 12 is a biomedical focal point containing KRAS (the primary oncology drug target) and PAH (the classical newborn metabolic screening disease PKU).",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+12[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=12",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_12"
  },
  {
    id: "chr13",
    number: "13",
    name: "Chromosome 13",
    type: "Autosome",
    morphology: "Acrocentric",
    lengthBp: "~114 Million bp",
    estimatedGenes: "~300-400 genes",
    percentageOfGenome: "~3.5%",
    keyGenes: [
      { symbol: "BRCA2", name: "BRCA2 DNA Repair Associated", description: "Homologous recombination DNA double-strand repair; mutations give high risk of breast/ovarian cancer." },
      { symbol: "RB1", name: "Retinoblastoma 1", description: "The first identified human tumor suppressor; controls E2F transcription factors and cell cycle." },
      { symbol: "ATP7B", name: "Copper-Transporting ATPase 2", description: "Copper homeostasis in liver; mutations cause toxic Wilson's disease." }
    ],
    associatedConditions: [
      "Patau Syndrome (Trisomy 13)",
      "Hereditary Breast and Ovarian Cancer Syndrome (BRCA2)",
      "Retinoblastoma & Osteosarcoma (RB1)",
      "Wilson Disease (Copper Accumulation Disorder)"
    ],
    scientificOverview: "Chromosome 13 is an acrocentric chromosome whose trisomy causes Patau syndrome. It contains two landmark cancer genes: RB1 (the paradigm of the 'two-hit hypothesis') and BRCA2.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+13[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=13",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_13"
  },
  {
    id: "chr14",
    number: "14",
    name: "Chromosome 14",
    type: "Autosome",
    morphology: "Acrocentric",
    lengthBp: "~107 Million bp",
    estimatedGenes: "~800 genes",
    percentageOfGenome: "~3.5%",
    keyGenes: [
      { symbol: "IGH Cluster", name: "Immunoglobulin Heavy Locus", description: "Encodes all human antibodies (IgM, IgD, IgG, IgA, IgE); crucial for B cell adaptive immunity." },
      { symbol: "PSEN1", name: "Presenilin 1", description: "Catalytic core of gamma-secretase; primary cause of familial early-onset Alzheimer's disease." },
      { symbol: "SERPINA1", name: "Alpha-1 Antitrypsin", description: "Protease inhibitor protecting lung tissue; deficiency causes emphysema and cirrhosis." }
    ],
    associatedConditions: [
      "Alpha-1 Antitrypsin Deficiency (COPD & Liver Disease)",
      "Familial Early-Onset Alzheimer's Disease (PSEN1)",
      "Burkitt Lymphoma t(8;14) translocations",
      "Kagami-Ogata & Temple Syndromes (14q32 imprinting)"
    ],
    scientificOverview: "Chromosome 14 contains the immunoglobulin heavy chain locus (IGH) which undergoes V(D)J somatic recombination to produce millions of antibody variants, plus the PSEN1 Alzheimer gene.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+14[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=14",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_14"
  },
  {
    id: "chr15",
    number: "15",
    name: "Chromosome 15",
    type: "Autosome",
    morphology: "Acrocentric",
    lengthBp: "~102 Million bp",
    estimatedGenes: "~600 genes",
    percentageOfGenome: "~3%",
    keyGenes: [
      { symbol: "UBE3A", name: "Ubiquitin Protein Ligase E3A", description: "Maternally expressed gene in neurons; maternal deletion causes Angelman syndrome." },
      { symbol: "SNRPN", name: "Small Nuclear Ribonucleoprotein Polypeptide N", description: "Paternally expressed locus in 15q11-q13; paternal deletion causes Prader-Willi syndrome." },
      { symbol: "FBN1", name: "Fibrillin 1", description: "Extracellular microfibril scaffold; mutations cause Marfan syndrome and aortic aneurysm." },
      { symbol: "HEXA", name: "Hexosaminidase Subunit Alpha", description: "Lysosomal lipid degradation; deficiency causes fatal Tay-Sachs neurodegeneration." }
    ],
    associatedConditions: [
      "Prader-Willi Syndrome (Paternal 15q11-q13 loss)",
      "Angelman Syndrome (Maternal UBE3A loss)",
      "Marfan Syndrome (FBN1 connective tissue disorder)",
      "Tay-Sachs Disease (HEXA deficiency)"
    ],
    scientificOverview: "Chromosome 15 is the definitive textbook model of genomic imprinting in humans, demonstrating how epigenetic parental origin (Prader-Willi vs Angelman syndrome) determines clinical phenotype.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+15[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=15",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_15"
  },
  {
    id: "chr16",
    number: "16",
    name: "Chromosome 16",
    type: "Autosome",
    morphology: "Metacentric",
    lengthBp: "~90 Million bp",
    estimatedGenes: "~850 genes",
    percentageOfGenome: "~3%",
    keyGenes: [
      { symbol: "HBA1 / HBA2", name: "Hemoglobin Subunit Alpha 1 & 2", description: "Alpha-globin chains; deletions cause Alpha-Thalassemia and Hb Bart hydrops fetalis." },
      { symbol: "PKD1", name: "Polycystin 1", description: "Renal tubular cilia function; mutations cause 85% of Autosomal Dominant Polycystic Kidney Disease." },
      { symbol: "CDH1", name: "E-Cadherin", description: "Cell adhesion molecule; loss leads to Hereditary Diffuse Gastric Cancer and lobular breast cancer." }
    ],
    associatedConditions: [
      "Alpha-Thalassemia Major & Minor",
      "Autosomal Dominant Polycystic Kidney Disease (ADPKD1)",
      "Hereditary Diffuse Gastric Cancer (CDH1)",
      "Rubinstein-Taybi Syndrome (CREBBP)"
    ],
    scientificOverview: "Chromosome 16 contains the alpha-globin cluster essential for adult and fetal hemoglobin, alongside PKD1 whose mutations cause polycystic kidney disease in millions globally.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+16[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=16",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_16"
  },
  {
    id: "chr17",
    number: "17",
    name: "Chromosome 17",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~83 Million bp",
    estimatedGenes: "~1,200 genes",
    percentageOfGenome: "~2.5%",
    keyGenes: [
      { symbol: "TP53", name: "Tumor Protein P53 ('Guardian of the Genome')", description: "Master cell cycle arrest and apoptosis activator; mutated in >50% of all human cancers; Li-Fraumeni syndrome." },
      { symbol: "BRCA1", name: "BRCA1 DNA Repair Associated", description: "DNA double-strand break repair; hereditary high risk for breast and ovarian cancers." },
      { symbol: "ERBB2 / HER2", name: "Human Epidermal Growth Factor Receptor 2", description: "Receptor tyrosine kinase amplified in aggressive breast and gastric cancers; targeted by Trastuzumab (Herceptin)." },
      { symbol: "NF1", name: "Neurofibromin 1", description: "RAS GTPase-activating protein; mutations cause Neurofibromatosis Type 1." }
    ],
    associatedConditions: [
      "Li-Fraumeni Cancer Syndrome (TP53)",
      "Hereditary Breast & Ovarian Cancer (BRCA1)",
      "Neurofibromatosis Type 1 (NF1)",
      "Charcot-Marie-Tooth Disease Type 1A (PMP22 duplication)",
      "Smith-Magenis Syndrome (17p11.2 deletion)"
    ],
    scientificOverview: "Chromosome 17 has the highest density of critical tumor suppressor genes in the human genome, featuring TP53 ('the guardian of the genome'), BRCA1, HER2/neu, and NF1.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+17[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=17",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_17"
  },
  {
    id: "chr18",
    number: "18",
    name: "Chromosome 18",
    type: "Autosome",
    morphology: "Submetacentric",
    lengthBp: "~80 Million bp",
    estimatedGenes: "~270 genes",
    percentageOfGenome: "~2.5%",
    keyGenes: [
      { symbol: "SMAD4", name: "SMAD Family Member 4", description: "TGF-beta signaling transducer; mutated in Juvenile Polyposis and pancreatic cancer." },
      { symbol: "NPC1", name: "Niemann-Pick Disease Type C1", description: "Intracellular cholesterol trafficking; deficiency causes fatal childhood lipid accumulation." },
      { symbol: "BCL2", name: "B-Cell Lymphoma 2", description: "Anti-apoptotic regulator; t(14;18) translocation causes follicular lymphoma." }
    ],
    associatedConditions: [
      "Edwards Syndrome (Trisomy 18)",
      "Niemann-Pick Disease Type C",
      "Follicular Lymphoma t(14;18) BCL2 overexpression",
      "18q- Deletion Syndrome (De Grouchy Syndrome)"
    ],
    scientificOverview: "Chromosome 18 is one of the least gene-dense autosomes, which explains why infants with Edwards syndrome (Trisomy 18) can survive to birth unlike other autosomal trisomies.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+18[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=18",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_18"
  },
  {
    id: "chr19",
    number: "19",
    name: "Chromosome 19",
    type: "Autosome",
    morphology: "Metacentric",
    lengthBp: "~59 Million bp",
    estimatedGenes: "~1,400 genes",
    percentageOfGenome: "~2%",
    keyGenes: [
      { symbol: "APOE", name: "Apolipoprotein E", description: "Lipid transport; APOE-epsilon4 allele is the strongest genetic risk factor for late-onset Alzheimer's." },
      { symbol: "LDLR", name: "Low-Density Lipoprotein Receptor", description: "Clears LDL cholesterol from blood; mutations cause Familial Hypercholesterolemia and early heart attacks." },
      { symbol: "NOTCH3", name: "Notch Receptor 3", description: "Vascular smooth muscle signaling; causes CADASIL hereditary stroke disorder." },
      { symbol: "DMPK", name: "DM1 Protein Kinase", description: "CTG trinucleotide repeat expansion causes Myotonic Dystrophy Type 1." }
    ],
    associatedConditions: [
      "Alzheimer's Disease Susceptibility (APOE ε4)",
      "Familial Hypercholesterolemia (LDLR mutations)",
      "Myotonic Dystrophy Type 1 (DMPK CTG expansion)",
      "CADASIL (Cerebral Autosomal Dominant Arteriopathy with Subcortical Infarcts)"
    ],
    scientificOverview: "Chromosome 19 has the highest gene density of all human chromosomes—more than double the genome average. It contains the cardiovascular/Alzheimer master gene APOE and LDL receptor.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+19[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=19",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_19"
  },
  {
    id: "chr20",
    number: "20",
    name: "Chromosome 20",
    type: "Autosome",
    morphology: "Metacentric",
    lengthBp: "~64 Million bp",
    estimatedGenes: "~550 genes",
    percentageOfGenome: "~2%",
    keyGenes: [
      { symbol: "PRNP", name: "Prion Protein", description: "Causes Creutzfeldt-Jakob disease (CJD), Kuru, and fatal familial insomnia when misfolded into PrPSc." },
      { symbol: "ADA", name: "Adenosine Deaminase", description: "Purine metabolism; deficiency causes Severe Combined Immunodeficiency (ADA-SCID 'Bubble Boy')." },
      { symbol: "GNAS", name: "Gs Alpha Subunit", description: "Complex imprinted locus causing McCune-Albright and Albright hereditary osteodystrophy." }
    ],
    associatedConditions: [
      "Creutzfeldt-Jakob Disease & Fatal Familial Insomnia (PRNP Prions)",
      "ADA-SCID (Severe Combined Immunodeficiency)",
      "Alagille Syndrome Type 1 (JAG1)",
      "McCune-Albright Syndrome (GNAS mosaic mutations)"
    ],
    scientificOverview: "Chromosome 20 harbors the PRNP gene whose infectious misfolded prion isoforms cause transmissible spongiform encephalopathies, and ADA, the first target of human gene therapy in 1990.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+20[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=20",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_20"
  },
  {
    id: "chr21",
    number: "21",
    name: "Chromosome 21",
    type: "Autosome",
    morphology: "Acrocentric",
    lengthBp: "~48 Million bp",
    estimatedGenes: "~250-300 genes",
    percentageOfGenome: "~1.5%",
    keyGenes: [
      { symbol: "APP", name: "Amyloid Precursor Protein", description: "Cleaved to form amyloid-beta plaques; extra copy in Trisomy 21 causes Alzheimer's neuropathology." },
      { symbol: "SOD1", name: "Superoxide Dismutase 1", description: "Destroys toxic free radicals; mutations cause familial Amyotrophic Lateral Sclerosis (ALS)." },
      { symbol: "RUNX1", name: "Runt-Related Transcription Factor 1", description: "Hematopoietic stem cell differentiation; mutated in Acute Myeloid Leukemia (AML)." },
      { symbol: "DYRK1A", name: "Dual Specificity Tyrosine Phosphorylation Regulated Kinase 1A", description: "Drives neurodevelopmental phenotypes and intellectual differences in Down syndrome." }
    ],
    associatedConditions: [
      "Down Syndrome (Trisomy 21 / 47,XX,+21 or 47,XY,+21)",
      "Early-Onset Alzheimer's Disease in Down Syndrome",
      "Familial Amyotrophic Lateral Sclerosis (ALS / Lou Gehrig's Disease via SOD1)",
      "Acute Megakaryoblastic Leukemia (AMKL)"
    ],
    scientificOverview: "Chromosome 21 is the smallest human autosome and the cause of Down syndrome (Trisomy 21), occurring in roughly 1 in 700 live births. Its APP gene causes premature Alzheimer-type pathology in almost all individuals with trisomy 21 by age 40.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+21[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=21",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_21"
  },
  {
    id: "chr22",
    number: "22",
    name: "Chromosome 22",
    type: "Autosome",
    morphology: "Acrocentric",
    lengthBp: "~51 Million bp",
    estimatedGenes: "~500-600 genes",
    percentageOfGenome: "~1.6%",
    keyGenes: [
      { symbol: "BCR", name: "Breakpoint Cluster Region", description: "Fuses with ABL1 to form BCR-ABL1 in the Philadelphia chromosome t(9;22)." },
      { symbol: "TBX1", name: "T-Box Transcription Factor 1", description: "Pharyngeal arch and cardiovascular development; deleted in 22q11.2 DiGeorge syndrome." },
      { symbol: "NF2", name: "Merlin / Neurofibromin 2", description: "Tumor suppressor; mutations cause bilateral acoustic neuromas in Neurofibromatosis Type 2." },
      { symbol: "COMT", name: "Catechol-O-Methyltransferase", description: "Degrades dopamine, epinephrine, and norepinephrine in the prefrontal cortex." }
    ],
    associatedConditions: [
      "DiGeorge Syndrome / Velo-Cardio-Facial Syndrome (22q11.2 Deletion)",
      "Chronic Myeloid Leukemia (Philadelphia Chromosome t(9;22))",
      "Neurofibromatosis Type 2 (Bilateral Schwannomas)",
      "Cat Eye Syndrome (Chromosome 22 partial tetrasomy)"
    ],
    scientificOverview: "Chromosome 22 was historically the first human chromosome to be fully sequenced in 1999 by the Human Genome Project. It is the site of the common 22q11.2 deletion (DiGeorge syndrome).",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+22[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=22",
    wikiLink: "https://en.wikipedia.org/wiki/Chromosome_22"
  },
  {
    id: "chrX",
    number: "X",
    name: "Chromosome X",
    type: "Sex Chromosome",
    morphology: "Submetacentric",
    lengthBp: "~156 Million bp",
    estimatedGenes: "~800-900 genes",
    percentageOfGenome: "~5%",
    keyGenes: [
      { symbol: "DMD", name: "Dystrophin (Largest Human Gene - 2.2 Mbp)", description: "Anchors muscle cytoskeleton to ECM; frame-shift deletions cause fatal Duchenne Muscular Dystrophy." },
      { symbol: "F8 / F9", name: "Coagulation Factor VIII & IX", description: "Essential blood clotting cascade proteins; deficiencies cause Hemophilia A and Hemophilia B ('Royal Disease')." },
      { symbol: "MECP2", name: "Methyl-CpG Binding Protein 2", description: "Epigenetic transcriptional repressor; mutations cause Rett syndrome in females." },
      { symbol: "OPN1LW / OPN1MW", name: "Red/Green Cone Photopigments", description: "Cone visual opsins; unequal crossing-over causes X-linked Red-Green Color Blindness." },
      { symbol: "FMR1", name: "Fragile X Messenger Ribonucleoprotein 1", description: "CGG repeat expansion (>200 repeats) causes Fragile X Syndrome, the leading inherited form of intellectual disability." }
    ],
    associatedConditions: [
      "Duchenne and Becker Muscular Dystrophy (DMD)",
      "Hemophilia A and B (Clotting factor deficiencies)",
      "Fragile X Syndrome (FMR1 CGG expansion)",
      "Turner Syndrome (45,X in females)",
      "Klinefelter Syndrome (47,XXY in males)",
      "Red-Green Color Blindness",
      "Rett Syndrome (MECP2)"
    ],
    scientificOverview: "Chromosome X is one of two human sex chromosomes. Females (XX) undergo random X-inactivation (lyonization mediated by the non-coding XIST RNA) to equalize gene dosage with males (XY). Males are hemizygous, making them significantly more vulnerable to X-linked recessive disorders.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+X[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=X",
    wikiLink: "https://en.wikipedia.org/wiki/X_chromosome"
  },
  {
    id: "chrY",
    number: "Y",
    name: "Chromosome Y",
    type: "Sex Chromosome",
    morphology: "Acrocentric",
    lengthBp: "~57 Million bp",
    estimatedGenes: "~60-70 protein coding genes",
    percentageOfGenome: "~1.8%",
    keyGenes: [
      { symbol: "SRY", name: "Sex-Determining Region Y", description: "Master genetic switch that initiates male testis development; without it, female embryogenesis proceeds." },
      { symbol: "AZF Cluster", name: "Azoospermia Factor (AZFa, AZFb, AZFc)", description: "Contains DAZ and RBMY genes required for spermatogenesis; microdeletions cause male infertility." },
      { symbol: "USP9Y", name: "Ubiquitin Specific Peptidase 9 Y-Linked", description: "Essential spermatogenesis regulator located in the AZFa region." }
    ],
    associatedConditions: [
      "Y-Chromosome Microdeletion Male Infertility (Azoospermia / Oligospermia)",
      "Swyer Syndrome (46,XY Gonadal Dysgenesis due to SRY mutation)",
      "46,XX Testicular Disorder of Sex Development (SRY translocation to X)",
      "Jacob's Syndrome (47,XYY 'Supermale' Syndrome)"
    ],
    scientificOverview: "Chromosome Y is inherited exclusively from father to son (patrilineal lineage). It contains the SRY master testis-determining gene and extensive palindromic repeats that undergo gene conversion instead of homologous recombination with the X chromosome.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=chromosome+Y[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=Y",
    wikiLink: "https://en.wikipedia.org/wiki/Y_chromosome"
  },
  {
    id: "mtDNA",
    number: "MT",
    name: "Mitochondrial DNA (mtDNA)",
    type: "Mitochondrial",
    morphology: "Circular",
    lengthBp: "16,569 bp",
    estimatedGenes: "37 genes (13 proteins, 22 tRNAs, 2 rRNAs)",
    percentageOfGenome: "<0.01% (Extranuclear)",
    keyGenes: [
      { symbol: "MT-ND1 - MT-ND6", name: "NADH Dehydrogenase Subunits (Complex I)", description: "Oxidative phosphorylation electron transport chain; linked to Leber Hereditary Optic Neuropathy (LHON)." },
      { symbol: "MT-CO1 - MT-CO3", name: "Cytochrome c Oxidase Subunits (Complex IV)", description: "Terminal enzyme of mitochondrial respiratory chain." },
      { symbol: "MT-ATP6 / MT-ATP8", name: "ATP Synthase Subunits (Complex V)", description: "Generates cellular ATP; mutations cause NARP and Leigh syndrome." },
      { symbol: "MT-TL1", name: "tRNA Leucine 1", description: "Mitochondrial translation; m.3243A>G mutation causes MELAS syndrome." }
    ],
    associatedConditions: [
      "MELAS Syndrome (Mitochondrial Encephalomyopathy, Lactic Acidosis, Stroke-like episodes)",
      "Leber Hereditary Optic Neuropathy (LHON - sudden adult blindness)",
      "MERRF Syndrome (Myoclonic Epilepsy with Ragged Red Fibers)",
      "Leigh Syndrome (Subacute necrotizing encephalomyelopathy)",
      "Kearns-Sayre Syndrome (Large mtDNA deletions)"
    ],
    scientificOverview: "Mitochondrial DNA is a circular, double-stranded bacterial vestige (endosymbiotic theory) containing 16,569 base pairs inherited strictly maternally (from mother to all offspring). It lacks protective histones, resulting in a mutation rate ~10-20x higher than nuclear DNA, giving rise to heteroplasmy and mitochondrial diseases.",
    ncbiLink: "https://www.ncbi.nlm.nih.gov/gene/?term=MT[CHR]+AND+Homo+sapiens[ORGN]",
    ensemblLink: "https://www.ensembl.org/Homo_sapiens/Location/Chromosome?r=MT",
    wikiLink: "https://en.wikipedia.org/wiki/Mitochondrial_DNA"
  }
];

export function findChromosomeByIdOrQuery(query: string): ChromosomeInfo | null {
  const clean = query.toLowerCase().trim();
  
  // Direct match
  const directMatch = HUMAN_CHROMOSOMES.find(c => 
    c.id.toLowerCase() === clean || 
    c.number.toLowerCase() === clean || 
    c.name.toLowerCase() === clean
  );
  if (directMatch) return directMatch;

  // Patterns like "chromosome 21", "chr 21", "21", "x chromosome", "down syndrome"
  if (clean.includes("down syndrome") || clean.includes("trisomy 21")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "21") || null;
  }
  if (clean.includes("edwards syndrome") || clean.includes("trisomy 18")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "18") || null;
  }
  if (clean.includes("patau syndrome") || clean.includes("trisomy 13")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "13") || null;
  }
  if (clean.includes("turner syndrome") || clean.includes("klinefelter") || clean.includes("duchenne") || clean.includes("hemophilia")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "X") || null;
  }
  if (clean.includes("sry") || clean.includes("y chromosome") || clean.includes("male sex")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "Y") || null;
  }
  if (clean.includes("mitochondria") || clean.includes("mtdna") || clean.includes("melas")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "MT") || null;
  }
  if (clean.includes("cystic fibrosis") || clean.includes("cftr")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "7") || null;
  }
  if (clean.includes("sickle cell") || clean.includes("beta globin") || clean.includes("hbb")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "11") || null;
  }
  if (clean.includes("huntington") || clean.includes("achondroplasia")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "4") || null;
  }
  if (clean.includes("p53") || clean.includes("tp53") || clean.includes("brca1") || clean.includes("her2")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "17") || null;
  }
  if (clean.includes("brca2") || clean.includes("retinoblastoma") || clean.includes("rb1")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "13") || null;
  }
  if (clean.includes("alzheimer") && clean.includes("apoe")) {
    return HUMAN_CHROMOSOMES.find(c => c.number === "19") || null;
  }

  // Regex extraction for numbers: "chromosome 7", "chr. 7", "chromosome X"
  const match = clean.match(/chromosome\s*([0-9]{1,2}|x|y|mt)/i) || clean.match(/chr\s*([0-9]{1,2}|x|y|mt)/i);
  if (match && match[1]) {
    const target = match[1].toUpperCase();
    return HUMAN_CHROMOSOMES.find(c => c.number.toUpperCase() === target) || null;
  }

  return null;
}
