document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const resultContainer = document.getElementById('resultContainer');
    const promptOutput = document.getElementById('promptOutput');
    const nextStep = document.getElementById('nextStep');
    
    // Copy button internal elements
    const copyIcon = document.getElementById('copyIcon');
    const checkIcon = document.getElementById('checkIcon');
    const copyText = document.getElementById('copyText');

    // Generate Logic
    generateBtn.addEventListener('click', () => {
        // Gather Input Values
        const productType = document.getElementById('productType').value;
        const targetAudience = document.getElementById('targetAudience').value.trim();
        const problems = document.getElementById('problems').value.trim();
        const style = document.getElementById('style').value;
        const tone = document.getElementById('tone').value;
        const titleCount = document.getElementById('titleCount').value;
        const charLimit = document.getElementById('charLimit').value.trim();
        const forbiddenWords = document.getElementById('forbiddenWords').value.trim();

        // Get checked benefits
        const benefitsCheckboxes = document.querySelectorAll('input[name="benefits"]:checked');
        const benefits = Array.from(benefitsCheckboxes).map(cb => cb.value);

        // Validation
        if (!targetAudience || !problems) {
            alert("Mohon lengkapi Target Audiens dan Daftar Problem.");
            return;
        }

        if (benefits.length === 0) {
            alert("Pilih minimal satu sudut manfaat.");
            return;
        }

        // Process Data
        const problemsList = problems
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .map((p, i) => `${i + 1}. ${p}`)
            .join('\n');

        const benefitsString = benefits.length > 0 
            ? benefits.join(', ') 
            : 'Bebas, sesuaikan dengan konteks';

        const charLimitString = charLimit 
            ? `- Batas Panjang: Maksimal ${charLimit} karakter per judul.` 
            : '';

        const forbiddenString = forbiddenWords 
            ? `- HINDARI kata-kata berikut: ${forbiddenWords}` 
            : '';

        // Generate Prompt String locally (No API Key required)
        const prompt = `Bertindaklah sebagai Copywriter Profesional kelas dunia yang spesialis dalam Direct Response Marketing.

Konteks Produk:
- Jenis Produk: ${productType}
- Target Audiens: ${targetAudience}

Tugas Utama:
Saya membutuhkan ${titleCount} variasi judul yang SANGAT MENJUAL (high-converting) untuk SETIAP masalah yang saya cantumkan di bawah ini.

Daftar Masalah (Pain Points):
${problemsList}

Panduan & Batasan (Constraints):
1. Gaya Judul: Gunakan pendekatan "${style}".
2. Sudut Manfaat Utama: Fokus pada "${benefitsString}".
3. Nada Suara (Tone): Gunakan nada yang "${tone}".
${charLimitString}
${forbiddenString}

Format Output:
Berikan output dalam format daftar yang rapi. Kelompokkan judul berdasarkan "Masalah" yang diselesaikan. Jangan berikan penjelasan tambahan, langsung berikan daftar judulnya.`;

        // Update UI
        promptOutput.textContent = prompt;
        
        // Show result area styling
        resultContainer.classList.remove('opacity-50', 'translate-y-4');
        resultContainer.classList.add('opacity-100', 'translate-y-0');
        
        // Show buttons
        copyBtn.classList.remove('hidden');
        copyBtn.classList.add('flex'); // restore flex display
        nextStep.classList.remove('hidden');

        // Scroll to result (smooth)
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    });

    // Copy Logic
    copyBtn.addEventListener('click', () => {
        const textToCopy = promptOutput.textContent;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback
            copyBtn.classList.remove('bg-slate-700', 'hover:bg-slate-600', 'text-slate-200');
            copyBtn.classList.add('bg-green-600', 'text-white');
            
            copyIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');
            copyText.textContent = 'Tersalin!';

            // Reset after 2 seconds
            setTimeout(() => {
                copyBtn.classList.add('bg-slate-700', 'hover:bg-slate-600', 'text-slate-200');
                copyBtn.classList.remove('bg-green-600', 'text-white');
                
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
                copyText.textContent = 'Copy Prompt';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
});
