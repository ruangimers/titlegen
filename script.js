// --- Logic Generasi Prompt (Lokal / Tanpa API) ---

const generateChatGPTPrompt = (details) => {
  const {
    productType,
    targetAudience,
    problemList,
    titleStyle,
    tone,
    titleCount,
    charLimit,
    forbiddenWords,
    benefitAngles
  } = details;

  // Format constraints
  let constraints = "";
  if (charLimit && charLimit.trim() !== "") {
    constraints += `- Batas Karakter: Usahakan panjang judul maksimal sekitar ${charLimit} (atau ringkas agar tidak terpotong).\n`;
  }
  if (forbiddenWords && forbiddenWords.trim() !== "") {
    constraints += `- Larangan Kata: JANGAN gunakan kata-kata berikut: ${forbiddenWords}.\n`;
  }

  // Format angles
  const anglesStr = benefitAngles.length > 0 ? benefitAngles.join(', ') : "Manfaat Utama Produk";

  // Template Prompt untuk ChatGPT
  return `Bertindaklah sebagai Copywriter Kelas Dunia dengan spesialisasi dalam "High-Converting Headlines" dan Psikologi Persuasi.

Saya ingin Anda menulis kumpulan judul yang powerful, viral, dan menjual untuk produk digital saya.

INFORMASI PRODUK:
- Jenis Produk: ${productType}
- Target Audiens: ${targetAudience}
- Masalah Utama (Pain Points) yang diselesaikan:
${problemList}

TUGAS ANDA:
Buatlah ${titleCount} variasi judul yang sangat menarik (scroll-stopping) berdasarkan spesifikasi berikut.

SPESIFIKASI JUDUL:
1. Gaya Judul (Style): ${titleStyle}
2. Nada Suara (Tone): ${tone}
3. Sudut Pandang Manfaat (Angles): Fokuskan pada ${anglesStr}

ATURAN & BATASAN:
- Judul harus memicu rasa ingin tahu atau menawarkan solusi instan.
- Gunakan "Power Words" yang menggugah emosi.
- Hindari bahasa yang kaku, robotik, atau terlalu formal. Gunakan bahasa yang mengalir alami.
${constraints}

FORMAT OUTPUT:
Mohon sajikan hasilnya dalam bentuk daftar (bullet points).
Di sebelah setiap judul, berikan penjelasan singkat dalam kurung tentang prinsip psikologis yang digunakan (contoh: FOMO, Curiosity Gap, Promise of Value).

Silakan mulai.`;
};


// --- UI Logic ---

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const form = document.getElementById('promptForm');
  const inputs = form.querySelectorAll('input, select, textarea');
  const errorMsg = document.getElementById('errorMsg');
  
  // Elements for UI updates
  const btnIcon = document.getElementById('btnIcon');
  const loadingIcon = document.getElementById('loadingIcon');
  const resultContainer = document.getElementById('resultContainer');
  const emptyState = document.getElementById('emptyState');
  const resultContent = document.getElementById('resultContent');
  const outputPrompt = document.getElementById('outputPrompt');
  const copyText = document.getElementById('copyText');
  const copyIcon = document.getElementById('copyIcon');
  const checkIcon = document.getElementById('checkIcon');

  // Check form validity
  const checkValidity = () => {
    const productType = document.getElementById('productType').value;
    const targetAudience = document.getElementById('targetAudience').value.trim();
    const problemList = document.getElementById('problemList').value.trim();
    const titleStyle = document.getElementById('titleStyle').value;
    const tone = document.getElementById('tone').value;
    const titleCount = document.getElementById('titleCount').value;
    
    // Check checkboxes
    const checkedAngles = document.querySelectorAll('input[name="benefitAngles"]:checked').length > 0;

    const isValid = 
      productType !== "" &&
      targetAudience !== "" &&
      problemList !== "" &&
      titleStyle !== "" &&
      tone !== "" &&
      titleCount !== "" &&
      checkedAngles;

    if (isValid) {
      generateBtn.removeAttribute('disabled');
      generateBtn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
      generateBtn.classList.add('bg-indigo-600', 'text-white', 'hover:bg-indigo-700', 'shadow-indigo-200');
      errorMsg.classList.add('hidden');
    } else {
      generateBtn.setAttribute('disabled', 'true');
      generateBtn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed');
      generateBtn.classList.remove('bg-indigo-600', 'text-white', 'hover:bg-indigo-700', 'shadow-indigo-200');
      errorMsg.classList.remove('hidden');
    }
  };

  // Add listeners to all inputs
  inputs.forEach(input => {
    input.addEventListener('input', checkValidity);
    input.addEventListener('change', checkValidity);
    input.addEventListener('keyup', checkValidity);
  });

  // Handle Generate
  generateBtn.addEventListener('click', () => {
    // Collect Data
    const details = {
      productType: document.getElementById('productType').value,
      targetAudience: document.getElementById('targetAudience').value,
      problemList: document.getElementById('problemList').value,
      titleStyle: document.getElementById('titleStyle').value,
      tone: document.getElementById('tone').value,
      titleCount: document.getElementById('titleCount').value,
      charLimit: document.getElementById('charLimit').value,
      forbiddenWords: document.getElementById('forbiddenWords').value,
      benefitAngles: Array.from(document.querySelectorAll('input[name="benefitAngles"]:checked')).map(cb => cb.value)
    };

    // UI Loading State (Simulated for better UX)
    generateBtn.disabled = true;
    btnIcon.classList.add('hidden');
    loadingIcon.classList.remove('hidden');
    resultContainer.classList.add('opacity-90');
    
    // Simulate a short delay to feel like "processing"
    setTimeout(() => {
      try {
        const result = generateChatGPTPrompt(details);
        
        // Update Result
        outputPrompt.value = result;
        
        // Show Result UI
        emptyState.classList.add('hidden');
        resultContent.classList.remove('hidden');
        resultContainer.classList.remove('opacity-90');
        resultContainer.classList.add('opacity-100');
        
      } catch (error) {
        alert("Terjadi kesalahan: " + error.message);
      } finally {
        // Restore Button State
        generateBtn.disabled = false;
        btnIcon.classList.remove('hidden');
        loadingIcon.classList.add('hidden');
      }
    }, 600); // 600ms delay
  });

  // Handle Copy
  copyBtn.addEventListener('click', () => {
    const text = outputPrompt.value;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      // Toggle Copy UI
      copyBtn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
      copyBtn.classList.add('bg-emerald-100', 'text-emerald-700', 'border-emerald-200');
      copyText.innerText = "Disalin!";
      copyIcon.classList.add('hidden');
      checkIcon.classList.remove('hidden');

      setTimeout(() => {
        copyBtn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
        copyBtn.classList.remove('bg-emerald-100', 'text-emerald-700', 'border-emerald-200');
        copyText.innerText = "Copy Prompt";
        copyIcon.classList.remove('hidden');
        checkIcon.classList.add('hidden');
      }, 2000);
    });
  });

  // Initial check
  checkValidity();
});
