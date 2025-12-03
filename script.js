import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: In a production static site, you must handle API keys securely (e.g. backend proxy).
// For this environment/preview, we use process.env.API_KEY as mandated.
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// --- Configuration Constants ---
const generateMetaPrompt = async (details) => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    Anda adalah seorang Expert Prompt Engineer dan Copywriter Kelas Dunia. 
    Tugas Anda adalah membuat sebuah "Prompt ChatGPT" yang sangat terstruktur, canggih, dan efektif. 
    User akan menggunakan prompt hasil buatan Anda ini di ChatGPT untuk menghasilkan judul-judul produk digital yang viral, powerful, dan menjual.
    
    PERHATIAN: Output Anda HANYA boleh berupa teks Prompt final yang siap di-copy paste oleh user. Jangan ada teks pembuka atau penutup dari Anda.
  `;

  const promptContent = `
    Tolong buatkan Prompt ChatGPT yang lengkap dan terstruktur berdasarkan spesifikasi produk berikut:

    - Jenis Produk: ${details.productType}
    - Target Audiens: ${details.targetAudience}
    - Daftar Problem/Masalah (Pain Points): 
      ${details.problemList}
    - Gaya Judul (Title Style): ${details.titleStyle}
    - Sudut Manfaat (Benefit Angles): ${details.benefitAngles.join(', ') || 'Umum'}
    - Nada/Tone: ${details.tone}
    - Jumlah Judul yang diminta: ${details.titleCount}
    - Batas Karakter: ${details.charLimit ? details.charLimit + ' karakter' : 'Tidak ada batasan ketat'}
    - Pantangan/Larangan Kata (Forbidden Words): ${details.forbiddenWords || 'Tidak ada'}

    Struktur Prompt yang harus Anda buat (untuk di-generate):
    1. **Role Playing**: Instruksikan ChatGPT untuk berperan sebagai Copywriter ahli dengan tone ${details.tone}.
    2. **Context**: Jelaskan deskripsi produk, target audiens, dan daftar masalah yang ingin diselesaikan.
    3. **Task**: Minta ChatGPT membuat ${details.titleCount} variasi judul dengan gaya "${details.titleStyle}".
    4. **Focus Angles**: Tekankan pada sudut pandang manfaat: ${details.benefitAngles.join(', ') || 'Solusi praktis'}.
    5. **Constraints/Rules**: 
       - Judul harus singkat, padat, jelas.
       - Gunakan kata-kata power (Power Words).
       - ${details.forbiddenWords ? `JANGAN gunakan kata-kata berikut: ${details.forbiddenWords}.` : ''}
       - ${details.charLimit ? `Panjang judul maksimal sekitar ${details.charLimit} karakter.` : 'Panjang judul ideal untuk keterbacaan tinggi.'}
    6. **Format Output**: Minta output dalam bentuk daftar bullet points, dan berikan alasan psikologis singkat mengapa judul tersebut efektif di sebelahnya.

    Bahasa Prompt: Gunakan Bahasa Indonesia yang natural, instruktif, dan persuasif.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: promptContent,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    if (response.text) {
      return response.text.trim();
    } else {
      throw new Error("Tidak ada respon teks dari Gemini.");
    }
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw new Error("Gagal membuat prompt. Silakan coba lagi.");
  }
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
  });

  // Handle Generate
  generateBtn.addEventListener('click', async () => {
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

    // UI Loading State
    generateBtn.disabled = true;
    btnIcon.classList.add('hidden');
    loadingIcon.classList.remove('hidden');
    resultContainer.classList.add('opacity-90');
    
    try {
      const result = await generateMetaPrompt(details);
      
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
