/* Tajweed Islands – languages
   Menus and buttons are translated into 11 languages.
   Lesson text is English in Stage 1 (translations come in a later stage).
   Quran text always stays in Arabic. */
window.TI = window.TI || {};

TI.LANGS = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'ur', name: 'اردو', rtl: true },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'sw', name: 'Kiswahili' }
];

TI.STR = {
  en: { title: 'Tajweed Islands', chooseLang: 'Choose your language', newGame: 'New Game', cont: 'Continue', chooseChar: 'Who are you?', girl: 'Girl', boy: 'Boy', skin: 'Skin tone', choosePet: 'Choose your pet', cat: 'Cat', parrot: 'Parrot', chick: 'Chick', dove: 'Dove', next: 'Next', back: 'Back', ok: 'OK', talk: 'Talk', saved: 'Game saved', notebook: 'My Notebook', settings: 'Settings', sound: 'Sound', on: 'On', off: 'Off', correct: 'Correct!', notQuite: "Not quite — we'll review it at the end.", review: "Let's Review", ticketEarned: 'You earned a ferry ticket!', listen: 'Listen', record: 'Record', stop: 'Stop', playMine: 'Play mine', skip: 'Skip', close: 'Close', language: 'Language', script: 'Script', done: 'Done', lessons: 'Lessons', challenge: 'Challenge' },
  ar: { title: 'جزر التجويد', chooseLang: 'اختر لغتك', newGame: 'لعبة جديدة', cont: 'متابعة', chooseChar: 'من أنت؟', girl: 'بنت', boy: 'ولد', skin: 'لون البشرة', choosePet: 'اختر حيوانك الأليف', cat: 'قطة', parrot: 'ببغاء', chick: 'كتكوت', dove: 'حمامة', next: 'التالي', back: 'رجوع', ok: 'حسنًا', talk: 'تحدّث', saved: 'تم حفظ اللعبة', notebook: 'دفتري', settings: 'الإعدادات', sound: 'الصوت', on: 'تشغيل', off: 'إيقاف', correct: 'صحيح!', notQuite: 'ليس تمامًا — سنراجعها في النهاية.', review: 'لنراجع', ticketEarned: 'حصلت على تذكرة العبّارة!', listen: 'استمع', record: 'سجّل', stop: 'أوقف', playMine: 'استمع لتسجيلي', skip: 'تخطَّ', close: 'إغلاق', language: 'اللغة', script: 'الخط', done: 'تم', lessons: 'الدروس', challenge: 'التحدي' },
  ur: { title: 'تجوید کے جزیرے', chooseLang: 'اپنی زبان منتخب کریں', newGame: 'نیا کھیل', cont: 'جاری رکھیں', chooseChar: 'آپ کون ہیں؟', girl: 'لڑکی', boy: 'لڑکا', skin: 'جلد کا رنگ', choosePet: 'اپنا پالتو جانور منتخب کریں', cat: 'بلی', parrot: 'طوطا', chick: 'چوزہ', dove: 'کبوتر', next: 'اگلا', back: 'واپس', ok: 'ٹھیک ہے', talk: 'بات کریں', saved: 'کھیل محفوظ ہو گیا', notebook: 'میری کاپی', settings: 'ترتیبات', sound: 'آواز', on: 'آن', off: 'آف', correct: 'درست!', notQuite: 'بالکل نہیں — آخر میں ہم اسے دہرائیں گے۔', review: 'آئیں دہرائیں', ticketEarned: 'آپ کو فیری کا ٹکٹ مل گیا!', listen: 'سنیں', record: 'ریکارڈ کریں', stop: 'روکیں', playMine: 'میری آواز سنیں', skip: 'چھوڑیں', close: 'بند کریں', language: 'زبان', script: 'رسم الخط', done: 'مکمل', lessons: 'اسباق', challenge: 'چیلنج' },
  es: { title: 'Islas del Tajwid', chooseLang: 'Elige tu idioma', newGame: 'Nuevo juego', cont: 'Continuar', chooseChar: '¿Quién eres?', girl: 'Niña', boy: 'Niño', skin: 'Tono de piel', choosePet: 'Elige tu mascota', cat: 'Gato', parrot: 'Loro', chick: 'Pollito', dove: 'Paloma', next: 'Siguiente', back: 'Atrás', ok: 'Vale', talk: 'Hablar', saved: 'Partida guardada', notebook: 'Mi cuaderno', settings: 'Ajustes', sound: 'Sonido', on: 'Sí', off: 'No', correct: '¡Correcto!', notQuite: 'Casi — lo repasaremos al final.', review: 'Repasemos', ticketEarned: '¡Has ganado un billete de ferry!', listen: 'Escuchar', record: 'Grabar', stop: 'Parar', playMine: 'Oír mi voz', skip: 'Saltar', close: 'Cerrar', language: 'Idioma', script: 'Escritura', done: 'Hecho', lessons: 'Lecciones', challenge: 'Desafío' },
  fr: { title: 'Les Îles du Tajwid', chooseLang: 'Choisis ta langue', newGame: 'Nouvelle partie', cont: 'Continuer', chooseChar: 'Qui es-tu ?', girl: 'Fille', boy: 'Garçon', skin: 'Teint', choosePet: 'Choisis ton animal', cat: 'Chat', parrot: 'Perroquet', chick: 'Poussin', dove: 'Colombe', next: 'Suivant', back: 'Retour', ok: "D'accord", talk: 'Parler', saved: 'Partie sauvegardée', notebook: 'Mon carnet', settings: 'Paramètres', sound: 'Son', on: 'Activé', off: 'Désactivé', correct: 'Correct !', notQuite: 'Pas tout à fait — on revoit ça à la fin.', review: 'Révisons', ticketEarned: 'Tu as gagné un ticket de ferry !', listen: 'Écouter', record: 'Enregistrer', stop: 'Arrêter', playMine: 'Écouter ma voix', skip: 'Passer', close: 'Fermer', language: 'Langue', script: 'Écriture', done: 'Terminé', lessons: 'Leçons', challenge: 'Défi' },
  hi: { title: 'तजवीद द्वीप', chooseLang: 'अपनी भाषा चुनें', newGame: 'नया खेल', cont: 'जारी रखें', chooseChar: 'आप कौन हैं?', girl: 'लड़की', boy: 'लड़का', skin: 'त्वचा का रंग', choosePet: 'अपना पालतू जानवर चुनें', cat: 'बिल्ली', parrot: 'तोता', chick: 'चूज़ा', dove: 'कबूतर', next: 'आगे', back: 'पीछे', ok: 'ठीक है', talk: 'बात करें', saved: 'खेल सहेजा गया', notebook: 'मेरी कॉपी', settings: 'सेटिंग्स', sound: 'आवाज़', on: 'चालू', off: 'बंद', correct: 'सही!', notQuite: 'पूरी तरह नहीं — अंत में दोहराएँगे।', review: 'आइए दोहराएँ', ticketEarned: 'आपको फ़ेरी का टिकट मिला!', listen: 'सुनें', record: 'रिकॉर्ड करें', stop: 'रोकें', playMine: 'मेरी आवाज़ सुनें', skip: 'छोड़ें', close: 'बंद करें', language: 'भाषा', script: 'लिपि', done: 'पूरा', lessons: 'पाठ', challenge: 'चुनौती' },
  bn: { title: 'তাজবীদ দ্বীপপুঞ্জ', chooseLang: 'তোমার ভাষা বেছে নাও', newGame: 'নতুন খেলা', cont: 'চালিয়ে যাও', chooseChar: 'তুমি কে?', girl: 'মেয়ে', boy: 'ছেলে', skin: 'ত্বকের রং', choosePet: 'তোমার পোষা প্রাণী বেছে নাও', cat: 'বিড়াল', parrot: 'টিয়া', chick: 'মুরগির ছানা', dove: 'কবুতর', next: 'পরবর্তী', back: 'পেছনে', ok: 'ঠিক আছে', talk: 'কথা বলো', saved: 'খেলা সংরক্ষিত হয়েছে', notebook: 'আমার খাতা', settings: 'সেটিংস', sound: 'শব্দ', on: 'চালু', off: 'বন্ধ', correct: 'সঠিক!', notQuite: 'পুরোপুরি নয় — শেষে আমরা আবার দেখব।', review: 'চলো পুনরালোচনা করি', ticketEarned: 'তুমি ফেরির টিকিট পেয়েছ!', listen: 'শোনো', record: 'রেকর্ড করো', stop: 'থামাও', playMine: 'আমার রেকর্ডিং শোনো', skip: 'বাদ দাও', close: 'বন্ধ করো', language: 'ভাষা', script: 'লিপি', done: 'শেষ', lessons: 'পাঠ', challenge: 'চ্যালেঞ্জ' },
  id: { title: 'Pulau Tajwid', chooseLang: 'Pilih bahasamu', newGame: 'Permainan Baru', cont: 'Lanjutkan', chooseChar: 'Siapa kamu?', girl: 'Perempuan', boy: 'Laki-laki', skin: 'Warna kulit', choosePet: 'Pilih hewan peliharaanmu', cat: 'Kucing', parrot: 'Burung Beo', chick: 'Anak Ayam', dove: 'Merpati', next: 'Berikutnya', back: 'Kembali', ok: 'Oke', talk: 'Bicara', saved: 'Permainan disimpan', notebook: 'Buku Catatanku', settings: 'Pengaturan', sound: 'Suara', on: 'Nyala', off: 'Mati', correct: 'Benar!', notQuite: 'Belum tepat — kita ulas di akhir.', review: 'Ayo Mengulas', ticketEarned: 'Kamu mendapat tiket feri!', listen: 'Dengar', record: 'Rekam', stop: 'Berhenti', playMine: 'Putar suaraku', skip: 'Lewati', close: 'Tutup', language: 'Bahasa', script: 'Tulisan', done: 'Selesai', lessons: 'Pelajaran', challenge: 'Tantangan' },
  tr: { title: 'Tecvid Adaları', chooseLang: 'Dilini seç', newGame: 'Yeni Oyun', cont: 'Devam Et', chooseChar: 'Sen kimsin?', girl: 'Kız', boy: 'Erkek', skin: 'Ten rengi', choosePet: 'Evcil hayvanını seç', cat: 'Kedi', parrot: 'Papağan', chick: 'Civciv', dove: 'Güvercin', next: 'İleri', back: 'Geri', ok: 'Tamam', talk: 'Konuş', saved: 'Oyun kaydedildi', notebook: 'Defterim', settings: 'Ayarlar', sound: 'Ses', on: 'Açık', off: 'Kapalı', correct: 'Doğru!', notQuite: 'Tam değil — sonunda tekrar edeceğiz.', review: 'Hadi Tekrar Edelim', ticketEarned: 'Feribot bileti kazandın!', listen: 'Dinle', record: 'Kayıt Yap', stop: 'Durdur', playMine: 'Sesimi dinle', skip: 'Geç', close: 'Kapat', language: 'Dil', script: 'Yazı', done: 'Bitti', lessons: 'Dersler', challenge: 'Meydan Okuma' },
  ms: { title: 'Pulau Tajwid', chooseLang: 'Pilih bahasa anda', newGame: 'Permainan Baharu', cont: 'Teruskan', chooseChar: 'Siapakah anda?', girl: 'Perempuan', boy: 'Lelaki', skin: 'Warna kulit', choosePet: 'Pilih haiwan peliharaan anda', cat: 'Kucing', parrot: 'Burung Kakak Tua', chick: 'Anak Ayam', dove: 'Burung Merpati', next: 'Seterusnya', back: 'Kembali', ok: 'Okey', talk: 'Bercakap', saved: 'Permainan disimpan', notebook: 'Buku Nota Saya', settings: 'Tetapan', sound: 'Bunyi', on: 'Hidup', off: 'Mati', correct: 'Betul!', notQuite: 'Belum tepat — kita ulang kaji di akhir.', review: 'Jom Ulang Kaji', ticketEarned: 'Anda mendapat tiket feri!', listen: 'Dengar', record: 'Rakam', stop: 'Berhenti', playMine: 'Main rakaman saya', skip: 'Langkau', close: 'Tutup', language: 'Bahasa', script: 'Tulisan', done: 'Selesai', lessons: 'Pelajaran', challenge: 'Cabaran' },
  sw: { title: 'Visiwa vya Tajwid', chooseLang: 'Chagua lugha yako', newGame: 'Mchezo Mpya', cont: 'Endelea', chooseChar: 'Wewe ni nani?', girl: 'Msichana', boy: 'Mvulana', skin: 'Rangi ya ngozi', choosePet: 'Chagua mnyama wako', cat: 'Paka', parrot: 'Kasuku', chick: 'Kifaranga', dove: 'Njiwa', next: 'Ifuatayo', back: 'Rudi', ok: 'Sawa', talk: 'Ongea', saved: 'Mchezo umehifadhiwa', notebook: 'Daftari Langu', settings: 'Mipangilio', sound: 'Sauti', on: 'Washa', off: 'Zima', correct: 'Sahihi!', notQuite: 'Si sawa kabisa — tutapitia mwishoni.', review: 'Tupitie Tena', ticketEarned: 'Umepata tiketi ya feri!', listen: 'Sikiliza', record: 'Rekodi', stop: 'Simamisha', playMine: 'Sikiliza sauti yangu', skip: 'Ruka', close: 'Funga', language: 'Lugha', script: 'Hati', done: 'Imekamilika', lessons: 'Masomo', challenge: 'Changamoto' }
};

TI.lang = 'en';

TI.setLang = function (code) {
  if (!TI.STR[code]) code = 'en';
  TI.lang = code;
  var L = TI.LANGS.find(function (l) { return l.code === code; });
  document.documentElement.lang = code;
  document.documentElement.dir = L && L.rtl ? 'rtl' : 'ltr';
  try { localStorage.setItem('tajweedIslands.lang', code); } catch (e) { /* storage unavailable */ }
};

TI.t = function (key) {
  var s = TI.STR[TI.lang];
  return (s && s[key]) || TI.STR.en[key] || key;
};

/* Ms. Afra's Color Code:  [r]…[/r] = red (hold / stretch),  [b]…[/b] = blue (tricky word) */
TI.colorize = function (s) {
  return String(s)
    .replace(/\[r\]([\s\S]*?)\[\/r\]/g, '<span class="c-red">$1</span>')
    .replace(/\[b\]([\s\S]*?)\[\/b\]/g, '<span class="c-blue">$1</span>')
    .replace(/\[h\]([\s\S]*?)\[\/h\]/g, '<span class="c-hl">$1</span>');
};
