/* Tajweed Islands – learning content (Stage 1)
   Color code markup:  [r]…[/r] = red (hold / stretch)   [b]…[/b] = blue (tricky word)
   Audio codes are surah+ayah for everyayah.com, e.g. "001003" = Al-Fatiha 1:3 */
(function () {
  var C = TI.Content = {};

  /* The full journey, in unlock order */
  C.ORDER = [
    { id: 'starter', name: 'Starter Island' },
    { id: 'makharij', name: 'Makharij Isle' },
    { id: 'noon', name: 'Noon Saakin Island' },
    { id: 'meem', name: 'Meem Saakin Island' },
    { id: 'qalqalah', name: 'Qalqalah Cliffs' },
    { id: 'madd', name: 'Madd Desert' },
    { id: 'leen', name: 'Leen Aclopips' },
    { id: 'heavylight', name: 'Heavy & Light Volcano' },
    { id: 'ghunnah', name: 'Ghunnah Grove' },
    { id: 'waqf', name: 'Waqf Lighthouse' },
    { id: 'final', name: 'Final Recitation Island' },
    { id: 'wudu', name: 'Wudu Island' },
    { id: 'azan', name: 'Azan Island' },
    { id: 'iqamah', name: 'Iqamah Island' },
    { id: 'prayer', name: 'Prayer Island' },
    { id: 'jummah', name: 'Jummah Island' },
    { id: 'dua', name: 'Dua Islands' },
    { id: 'prophets', name: 'Prophet Islands' },
    { id: 'fatiha', name: 'Surah Al-Fatiha Island' },
    { id: 'nas', name: 'Surah An-Nas Island' },
    { id: 'fil', name: 'Surah Al-Fil Island' },
    { id: 'qalam', name: 'Surah Al-Qalam Island' }
  ];

  /* Islands placed in the 3D world (the rest are beyond the horizon for now) */
  C.MAP = [
    { id: 'harbor', x: 0, z: 0, r: 18, grass: 0x7cc36b, built: true },
    { id: 'starter', x: 70, z: -150, r: 22, grass: 0x8fd16b, built: true,
      roof: 0x2a9d8f, board: ['ا ب ت ث', 'Starter Island'], label: '📖 Starter Island' },
    { id: 'makharij', x: -50, z: -235, r: 20, grass: 0x6fbf73, built: true, style: 'makharij',
      roof: 0x7b5ea7, board: ['مَخَارِج', 'Makharij Isle'], label: '👄 Makharij Isle' },
    { id: 'noon', x: 60, z: -320, r: 20, grass: 0x7fcf6f, built: true,
      roof: 0xe76f51, board: ['نْ  ـً ـٍ ـٌ', 'Noon Saakin Island'], label: '🌴 Noon Saakin Island' },
    { id: 'meem', x: -40, z: -400, r: 20, grass: 0x9ad37a, built: true,
      roof: 0xd6336c, board: ['مْ', 'Meem Saakin Island'], label: '🌺 Meem Saakin Island' },
    { id: 'qalqalah', x: 70, z: -470, r: 18, grass: 0x8fae6b, built: true, style: 'cliffs',
      roof: 0x5c7c99, board: ['قُطْبُ جَدٍّ', 'Qalqalah Cliffs'], label: '⛰️ Qalqalah Cliffs' },
    { id: 'madd', x: -30, z: -545, r: 20, grass: 0xeccf8e, built: true, style: 'desert',
      roof: 0xc8553d, board: ['مَدّ', 'Madd Desert'], label: '🐪 Madd Desert' },
    { id: 'leen', x: 65, z: -625, r: 20, grass: 0x74c69d, built: true, style: 'aclopips',
      roof: 0x2ec4b6, board: ['وْ  يْ', 'Leen Aclopips'], label: '🌿 Leen Aclopips' }
  ];

  C.islandName = function (id) {
    if (id === 'harbor') return 'The Harbor';
    var o = C.ORDER.find(function (i) { return i.id === id; });
    return o ? o.name : id;
  };

  C.nextIsland = function (id) {
    var i = C.ORDER.findIndex(function (o) { return o.id === id; });
    return i >= 0 && i < C.ORDER.length - 1 ? C.ORDER[i + 1].id : null;
  };

  /* Prayer times in the game's clock (minutes after midnight) */
  C.PRAYERS = [
    { name: 'Fajr', m: 5 * 60 },
    { name: 'Dhuhr', m: 12 * 60 + 30 },
    { name: 'Asr', m: 15 * 60 + 45 },
    { name: 'Maghrib', m: 18 * 60 + 30 },
    { name: 'Isha', m: 20 * 60 }
  ];

  /* The 28 letters: [letter, English name, Arabic name] */
  C.LETTERS = [
    ['ا', 'Alif', 'أَلِف'], ['ب', 'Baa', 'بَاء'], ['ت', 'Taa', 'تَاء'], ['ث', 'Thaa', 'ثَاء'],
    ['ج', 'Jeem', 'جِيم'], ['ح', 'Ḥaa', 'حَاء'], ['خ', 'Khaa', 'خَاء'], ['د', 'Daal', 'دَال'],
    ['ذ', 'Dhaal', 'ذَال'], ['ر', 'Raa', 'رَاء'], ['ز', 'Zay', 'زَاي'], ['س', 'Seen', 'سِين'],
    ['ش', 'Sheen', 'شِين'], ['ص', 'Ṣaad', 'صَاد'], ['ض', 'Ḍaad', 'ضَاد'], ['ط', 'Ṭaa', 'طَاء'],
    ['ظ', 'Ẓaa', 'ظَاء'], ['ع', 'ʿAyn', 'عَيْن'], ['غ', 'Ghayn', 'غَيْن'], ['ف', 'Faa', 'فَاء'],
    ['ق', 'Qaaf', 'قَاف'], ['ك', 'Kaaf', 'كَاف'], ['ل', 'Laam', 'لَام'], ['م', 'Meem', 'مِيم'],
    ['ن', 'Noon', 'نُون'], ['ه', 'Haa', 'هَاء'], ['و', 'Waw', 'وَاو'], ['ي', 'Yaa', 'يَاء']
  ];

  function ex(items) {
    return '<div class="ex">' + items.map(function (it) {
      return '<div><span class="quran">' + it[0] + '</span>' + it[1] + '</div>';
    }).join('') + '</div>';
  }

  /* ================= STARTER ISLAND ================= */
  C.starter = {
    id: 'starter',
    title: 'Starter Island',
    intro: 'Learn the building blocks of every ayah. Tap a lesson to begin, then try the challenge!',
    welcome: 'Welcome to Starter Island! Come and find me at the learning pavilion, the one with the teal roof.',
    lessons: [
      {
        id: 'letters', title: 'The Arabic Letters',
        note: 'Arabic has 28 letters and is read from right to left. Look carefully at the dots: ب ت ث.',
        pages: [
          { html: '<p>The Quran is written in Arabic. Arabic has <b>28 letters</b>, and it is read from <b>right to left</b> ⬅️.</p>' +
              '<div class="ayah quran">ا ب ت ث ج</div>' +
              '<p>Most letters join to the letter next to them, so their shape changes a little at the start, middle or end of a word. Don\'t worry, you\'ll get used to them!</p>' },
          { type: 'letters', html: '<p>Tap any letter to see its name. (If your device has an Arabic voice, you will hear it too.)</p>' },
          { html: '<p>Some letters have the same shape and are told apart only by their <b>dots</b>. Look carefully!</p>' +
              ex([['ب', 'Baa · 1 dot below'], ['ت', 'Taa · 2 dots above'], ['ث', 'Thaa · 3 dots above']]) +
              ex([['ح', 'Ḥaa · no dot'], ['ج', 'Jeem · dot inside'], ['خ', 'Khaa · dot above']]) +
              '<p>Some letters sound close but are different: <span class="quran">ح</span> and <span class="quran">ه</span>, <span class="quran">س</span> and <span class="quran">ص</span>, <span class="quran">ت</span> and <span class="quran">ط</span>. On <b>Makharij Isle</b> you will learn exactly where each one comes from in the mouth.</p>' }
        ]
      },
      {
        id: 'harakat', title: 'Harakat: the short vowels',
        note: 'Fatha (بَ "ba"), Kasra (بِ "bi"), Damma (بُ "bu"). Tanween adds an "n": بًا بٍ بٌ.',
        pages: [
          { html: '<p>Harakat are small marks that tell you which vowel sound to say.</p>' +
              ex([['بَ', '<b>Fatha</b> · "ba"<br>a line above'], ['بِ', '<b>Kasra</b> · "bi"<br>a line below'], ['بُ', '<b>Damma</b> · "bu"<br>a little waw above']]) +
              '<p>Say them quickly and lightly. They are <b>short</b> sounds.</p>' },
          { html: '<p><b>Tanween</b> is when the mark is doubled. It adds an <b>"n"</b> sound at the end.</p>' +
              ex([['بًا', '"ban"'], ['بٍ', '"bin"'], ['بٌ', '"bun"']]) +
              '<p>You will meet tanween again on <b>Noon Saakin Island</b>, because it sounds just like a noon!</p>' }
        ]
      },
      {
        id: 'sukoon', title: 'Sukoon & Shaddah',
        note: 'Sukoon (ْ) = no vowel, rest on the letter: قُلْ "qul". Shaddah (ّ) = the letter is doubled: رَبِّ "rab-bi".',
        pages: [
          { html: '<p><b>Sukoon</b> <span class="quran big">ْ</span> is a small circle above a letter. The letter has <b>no vowel</b>, so you rest on it and join it to the letter before.</p>' +
              ex([['قُلْ', '"qul"'], ['مِنْ', '"min"'], ['لَمْ', '"lam"']]) },
          { html: '<p><b>Shaddah</b> <span class="quran big">ّ</span> is a small "w"-shaped mark. It means the letter is <b>doubled</b>: you say it once with a sukoon, then again with its vowel.</p>' +
              ex([['رَبِّ', '"rab-bi"'], ['إِنَّ', '"in-na"'], ['ٱللَّهِ', '"Al-lāh"']]) +
              '<p>You can find <span class="quran">رَبِّ</span> in Surah Al-Fatiha: <span class="quran">ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ</span></p>' }
        ]
      },
      {
        id: 'leen', title: 'Leen Letters: the soft letters',
        note: 'و or ي with a sukoon after a fatha are leen letters: خَوْف "khawf", بَيْت "bayt". Say them softly.',
        pages: [
          { html: '<p>There are two <b>leen</b> (soft) letters: <span class="quran big">و</span> and <span class="quran big">ي</span>.</p>' +
              '<p>They are leen when they have a <b>sukoon</b> and the letter <b>before</b> them has a <b>fatha</b>. Say them softly and easily.</p>' +
              ex([['خَوْف', '"khawf" · fear'], ['بَيْت', '"bayt" · house']]) },
          { html: '<p><b>Careful!</b> These look similar but are <b>not</b> leen:</p>' +
              ex([['نُور', '"noor" · و after a damma'], ['قِيل', '"qeel" · ي after a kasra']]) +
              '<p>Those are <b>madd</b> letters, which stretch. You will learn about them in the <b>Madd Desert</b>.</p>' },
          { html: '<p>Find leen letters in the Quran!</p>' +
              '<p>In Surah Al-Fatiha:</p><div class="ayah quran">مَٰلِكِ يَوْمِ ٱلدِّينِ</div>' +
              '<p><span class="quran">يَوْمِ</span> ("yawm") has a leen waw.</p>' +
              '<p>In Surah Quraysh, <span class="quran">ٱلْبَيْتِ</span> and <span class="quran">خَوْفٍۭ</span> both have leen letters. When you stop at the end of an ayah right after a leen letter, the soft sound may be stretched a little.</p>' }
        ]
      },
      {
        id: 'colorcode', title: "Ms. Afra's Color Code",
        note: 'Black = read normally. Red = hold / stretch it. Blue = tricky word, slow down.',
        pages: [
          { html: '<p>In this game, Quran words have three colors:</p>' +
              '<ul><li>⚫ <b>Black</b>: read it normally.</li>' +
              '<li>🔴 <b class="c-red">Red</b>: hold it / stretch it.</li>' +
              '<li>🔵 <b class="c-blue">Blue</b>: a tricky word, so slow down and be careful.</li></ul>' },
          { ayah: '068001', html: '<p>🔴 <b>Red</b> example: the first ayah of Surah Al-Qalam.</p>' +
              '<div class="ayah quran">[r]نٓ[/r] ۚ وَٱلْقَلَمِ وَمَا يَسْطُرُونَ</div>' +
              '<p>The letter <span class="quran c-red">نٓ</span> is read "Nūūūn". It is held for <b>6 counts</b>. Listen!</p>' },
          { html: '<p>🔵 <b>Blue</b> example:</p>' +
              '<div class="ayah quran">[b]أَنَا۠[/b]</div>' +
              '<p>In <span class="quran c-blue">أَنَا۠</span> ("I"), the last alif is written, but when you <b>keep reading</b> without stopping, you read it short: "ana". Only when you <b>stop</b> on it do you say "anā".</p>' +
              '<p>Whenever you see blue, slow down and think!</p>' }
        ]
      }
    ],

    challenge: [
      { prompt: 'Tap the letter Jeem.', options: ['ح', 'ج', 'خ', 'ه'], answer: 1,
        explain: 'Jeem (ج) has one dot inside its curve. Ḥaa (ح) has no dot, and Khaa (خ) has a dot on top.' },
      { prompt: 'Tap the letter Thaa.', options: ['ب', 'ت', 'ث', 'ن'], answer: 2,
        explain: 'Thaa (ث) has three dots on top. Baa has one dot below, Taa has two on top, and Noon has one on top with a deeper bowl.' },
      { prompt: 'Which one says "bu"?', options: ['بَ', 'بِ', 'بُ'], answer: 2,
        explain: 'A damma, the little waw shape above the letter, gives a "u" sound: بُ = "bu".' },
      { prompt: 'Which one has tanween (an "n" sound at the end)?', options: ['بَ', 'بٌ', 'بْ'], answer: 1,
        explain: 'Doubled marks are tanween. بٌ is read "bun".' },
      { prompt: 'Which word has a shaddah?', options: ['إِنَّ', 'مِنْ', 'لَمْ'], answer: 0,
        explain: 'إِنَّ has a shaddah on the noon, so it is read "in-na". مِنْ and لَمْ end with a sukoon.' },
      { prompt: 'In this word, which letter has the sukoon?', arabic: 'قُلْ', options: ['ق', 'ل'], answer: 1,
        explain: 'The small circle is on the laam, so you rest on it: "qul".' },
      { prompt: 'Which word has a leen letter?', options: ['بَيْتٌ', 'قِيلَ', 'نُورٌ'], answer: 0,
        explain: 'In بَيْتٌ the yaa has a sukoon and the letter before it has a fatha, so it is a leen letter: "bayt". In قِيلَ and نُورٌ they are madd letters.' },
      { prompt: 'Which word in this ayah has a leen letter?', arabic: 'مَٰلِكِ يَوْمِ ٱلدِّينِ', options: ['مَٰلِكِ', 'يَوْمِ', 'ٱلدِّينِ'], answer: 1,
        explain: 'يَوْمِ: the waw has a sukoon after a fatha, so it is read "yawm".' },
      { type: 'listen', prompt: 'Listen to the recitation. Which ayah did you hear?', audio: '001003',
        options: ['ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'مَٰلِكِ يَوْمِ ٱلدِّينِ'], answer: 1,
        explain: 'That was ayah 3 of Surah Al-Fatiha: "ar-Raḥmān ir-Raḥīm". Press Listen again and follow the words.' },
      { prompt: "In Ms. Afra's Color Code, what does red mean?", ar: false,
        options: ['Read it normally', 'Hold or stretch it', 'It is a tricky word'], answer: 1,
        explain: 'Red means hold it or stretch it, like the نٓ at the start of Surah Al-Qalam. Blue means a tricky word, and black means read normally.' },
      { type: 'record', prompt: 'Listen to the reciter, then record yourself reciting this ayah. Compare the two!',
        arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِ[r]ي[/r]مِ', audio: '001001',
        explain: 'Listen slowly, word by word, then try again. The Prophet ﷺ taught that someone who finds reciting the Quran hard, but keeps trying, gets a double reward.' }
    ]
  };

  /* ================= HARBOR TEST (skip Starter Island) ================= */
  C.harborTest = [
    { prompt: 'Tap the letter Ṣaad.', options: ['س', 'ص', 'ض', 'ش'], answer: 1 },
    { prompt: 'Which one says "bi"?', options: ['بَ', 'بِ', 'بُ'], answer: 1 },
    { prompt: 'Which word has a shaddah?', options: ['قُلْ', 'رَبِّ', 'بَيْتٌ'], answer: 1 },
    { prompt: 'In this word, which letter has the sukoon?', arabic: 'مِنْ', options: ['م', 'ن'], answer: 1 },
    { prompt: 'Which word has a leen letter?', options: ['نُورٌ', 'خَوْفٌ', 'قِيلَ'], answer: 1 }
  ];

  /* ================= MAKHARIJ ISLE ================= */
  /* The 5 main areas where letters come from. Used by the mouth diagram and the standing stones. */
  C.ZONES = [
    { id: 'jawf', icon: '🌬️', name: 'The Open Space', ar: 'ٱلْجَوْف', translit: 'Al-Jawf', letters: 'ا و ي',
      desc: 'The empty space inside the mouth and throat. The three madd (stretching) letters come from here: alif after a fatha, waw with a sukoon after a damma, and yaa with a sukoon after a kasra. Their sound flows out until your breath ends.' },
    { id: 'halq', icon: '🗣️', name: 'The Throat', ar: 'ٱلْحَلْق', translit: 'Al-Ḥalq', letters: 'ء ه · ع ح · غ خ',
      desc: 'Six letters in three parts. The deepest part (nearest the chest): ء ه. The middle: ع ح. The part nearest the mouth: غ خ.' },
    { id: 'lisan', icon: '👅', name: 'The Tongue', ar: 'ٱللِّسَان', translit: 'Al-Lisān', letters: 'ق ك ج ش ي ض ل ن ر ط د ت ص س ز ظ ذ ث',
      desc: '18 letters! The back of the tongue makes ق and ك. The middle makes ج ش ي. The side makes ض. The tip and edges make all the rest.' },
    { id: 'shafatan', icon: '👄', name: 'The Lips', ar: 'ٱلشَّفَتَان', translit: 'Ash-Shafatān', letters: 'ف ب م و',
      desc: 'For ف, the inside of the lower lip touches the tips of the top front teeth. For ب and م, both lips close. For و, both lips make a round shape without closing.' },
    { id: 'khayshum', icon: '👃', name: 'The Nose', ar: 'ٱلْخَيْشُوم', translit: 'Al-Khayshūm', letters: 'نّ مّ',
      desc: 'The nasal passage. The ghunnah (humming sound) of noon and meem comes from here. Try it: hum a long "nnn" and pinch your nose. The sound stops!' }
  ];

  C.makharij = {
    id: 'makharij',
    title: 'Makharij Isle',
    intro: 'Discover where every letter comes from. Visit the five standing stones, learn the lessons, then try the challenge!',
    welcome: 'Welcome to Makharij Isle! Each of the five standing stones shows one area where letters come from. Visit them, then find me at the pavilion with the purple roof.',
    lessons: [
      {
        id: 'mk-intro', title: 'What is a Makhraj?',
        note: 'A makhraj is the place a letter\'s sound comes from. There are 5 main areas: the open space, throat, tongue, lips and nose. Test a letter: say أَ + the letter with a sukoon (أَبْ) and feel where the sound stops.',
        pages: [
          { html: '<p>A <b>makhraj</b> (مَخْرَج) is the place where a letter\'s sound comes from: its "home". The plural is <b>makharij</b>.</p>' +
              '<p>Why does it matter? Look at these two words:</p>' +
              ex([['[b]قَلْب[/b]', '"qalb" · heart'], ['[b]كَلْب[/b]', '"kalb" · dog']]) +
              '<p>Only the first letter\'s home changed, and the whole meaning changed! That is why we take care with makharij when reading the Quran.</p>' },
          { type: 'mouth', html: '<p>There are <b>5 main areas</b>. Tap each one to see which letters live there.</p>' },
          { html: '<p><b>The makhraj test:</b> put a hamza with a fatha before a letter, and give the letter a sukoon. Say it slowly and feel where the sound <b>stops</b>. That is its makhraj!</p>' +
              ex([['أَبْ', '"ab" · lips'], ['أَقْ', '"aq" · back of the tongue'], ['أَحْ', '"aḥ" · middle of the throat']]) +
              '<p>Try it out loud now with a few letters.</p>' }
        ]
      },
      {
        id: 'mk-throat', title: 'The Throat Letters',
        note: 'Throat: ء ه (deepest), ع ح (middle), غ خ (nearest the mouth). Don\'t mix ح with ه, or ع with ء: عَلِيم = All-Knowing, أَلِيم = painful.',
        pages: [
          { html: '<p>Six letters come from the <b>throat</b>, in three levels:</p>' +
              ex([['ء ه', '<b>Deepest</b><br>near the chest'], ['ع ح', '<b>Middle</b>'], ['غ خ', '<b>Top</b><br>nearest the mouth']]) },
          { html: '<p>🔵 <b>Careful pairs!</b> These are tricky, so they are blue.</p>' +
              '<p><span class="quran big c-blue">ح</span> comes from the <b>middle</b> of the throat with a tight, breathy sound, as in <span class="quran c-blue">ٱلْحَمْدُ</span>. <span class="quran big c-blue">ه</span> is lighter and comes from <b>deep</b> in the throat, as in <span class="quran c-blue">هُوَ</span>.</p>' +
              '<p><span class="quran big">ع</span> squeezes the <b>middle</b> of the throat. <span class="quran big">ء</span> is a quick catch at the <b>deepest</b> part. Mixing them changes the meaning:</p>' +
              ex([['[b]عَلِيم[/b]', '"ʿalīm" · All-Knowing'], ['[b]أَلِيم[/b]', '"alīm" · painful']]) }
        ]
      },
      {
        id: 'mk-tongue', title: 'The Tongue Letters',
        note: 'Tongue: back ق ك · middle ج ش ي · side ض · edges ل · tip ن ر · tip + gums ط د ت · tip near teeth ص س ز · tip + teeth edges ظ ذ ث.',
        pages: [
          { html: '<p>The tongue makes <b>18 letters</b>! Let\'s start at the back.</p>' +
              ex([['ق', '<b>Back of the tongue</b><br>furthest back'], ['ك', '<b>Back of the tongue</b><br>a little forward']]) +
              ex([['ج ش ي', '<b>Middle of the tongue</b><br>touching the roof of the mouth']]) },
          { html: ex([['ض', '<b>Side of the tongue</b><br>against the upper back teeth'], ['ل', '<b>Front edges of the tongue</b>']]) +
              '<p>🔵 The letter <span class="quran big c-blue">ض</span> is tricky and so special that Arabic is called <b>"the language of the Ḍaad"</b>.</p>' },
          { html: '<p>The <b>tip of the tongue</b> makes the rest:</p>' +
              ex([['ن ر', 'tip of the tongue<br>(ر uses a bit more of the tongue)'], ['ط د ت', 'tip + the gums behind<br>the top front teeth']]) +
              ex([['ص س ز', 'tip near the front teeth<br>a whistling sound'], ['ظ ذ ث', 'tip touches the edges of<br>the top front teeth']]) +
              '<p>For <span class="quran">ظ ذ ث</span>, your tongue peeks out a tiny bit. Try it with a mirror!</p>' }
        ]
      },
      {
        id: 'mk-lips', title: 'Lips, Nose & the Open Space',
        note: 'Lips: ف (lower lip + top teeth), ب م (lips close), و (lips round). Nose: ghunnah. Open space: the madd letters ا و ي.',
        pages: [
          { html: '<p>Four letters come from the <b>lips</b>:</p>' +
              ex([['ف', 'inside of the lower lip<br>+ top front teeth'], ['ب م', 'both lips close'], ['و', 'lips make a circle<br>without closing']]) },
          { html: '<p>👃 <b>The nose</b> (al-khayshūm) is where <b>ghunnah</b>, the humming sound of noon and meem, comes from. You will learn much more in <b>Ghunnah Grove</b>.</p>' +
              '<p>🌬️ <b>The open space</b> (al-jawf) of the mouth and throat is where the <b>madd letters</b> come from:</p>' +
              ex([['قَ[r]ا[/r]لَ', 'alif after a fatha'], ['يَقُ[r]و[/r]لُ', 'waw after a damma'], ['قِ[r]ي[/r]لَ', 'yaa after a kasra']]) +
              '<p>🔴 They <b>stretch</b>, so they are red. You will explore them in the <b>Madd Desert</b>.</p>' }
        ]
      }
    ],

    challenge: [
      { prompt: 'Where does this letter come from?', arabic: 'ح', ar: false,
        options: ['The middle of the throat', 'The lips', 'The tip of the tongue'], answer: 0,
        explain: 'ح comes from the middle of the throat, together with ع.' },
      { prompt: 'Which letter comes from the lips?', options: ['ق', 'ح', 'ب', 'ض'], answer: 2,
        explain: 'ب is made by closing both lips. The other lip letters are ف م و.' },
      { prompt: 'Which two letters come from the deepest part of the throat?', options: ['ء ه', 'ع ح', 'غ خ'], answer: 0,
        explain: 'ء and ه come from the deepest part of the throat, nearest the chest.' },
      { prompt: 'Which two letters come from the part of the throat nearest the mouth?', options: ['غ خ', 'ء ه', 'ق ك'], answer: 0,
        explain: 'غ and خ come from the top of the throat, nearest the mouth. ق and ك come from the tongue, not the throat.' },
      { prompt: 'Which letter comes from the furthest back of the tongue?', options: ['ق', 'ك', 'ج'], answer: 0,
        explain: 'ق is the furthest back. ك is a little further forward, and ج is from the middle of the tongue.' },
      { prompt: 'Which letter uses the side of the tongue against the upper back teeth?', options: ['ض', 'ظ', 'د', 'ز'], answer: 0,
        explain: 'ض uses the side of the tongue. Arabic is even called "the language of the Ḍaad"!' },
      { prompt: 'For which letters does the tip of the tongue touch the edges of the top front teeth?', options: ['ث ذ ظ', 'ت د ط', 'س ص ز'], answer: 0,
        explain: 'For ث ذ ظ the tongue tip touches the edges of the top front teeth and peeks out a little.' },
      { prompt: 'How is the letter ف made?', ar: false,
        options: ['The inside of the lower lip touches the top front teeth', 'Both lips close together', 'The back of the tongue rises'], answer: 0,
        explain: 'For ف, the inside of the lower lip touches the tips of the top front teeth.' },
      { prompt: 'Where does ghunnah (the humming sound) come from?', ar: false,
        options: ['The nose', 'The throat', 'The lips'], answer: 0,
        explain: 'Ghunnah comes from the nose (al-khayshūm). Pinch your nose while humming and the sound stops!' },
      { prompt: 'Which word means "heart"?', options: ['قَلْب', 'كَلْب'], answer: 0,
        explain: 'قَلْب (with ق from the back of the tongue) means heart. كَلْب (with ك) means dog. One makhraj changes everything!' },
      { type: 'listen', prompt: 'Listen carefully to the last word. Which ayah did you hear?', audio: '113001',
        options: ['قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ', 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ', 'قُلْ هُوَ ٱللَّهُ أَحَدٌ'], answer: 0,
        explain: 'That was the first ayah of Surah Al-Falaq. Its last word, ٱلْفَلَقِ, starts with ف from the lips and ends with ق from the back of the tongue.' },
      { type: 'record', prompt: 'Listen, then record yourself. Make ه (deep throat) and ح (middle throat) sound clearly different!',
        arabic: 'قُلْ [b]هُوَ[/b] ٱللَّهُ [b]أَحَدٌ[/b]', audio: '112001',
        explain: 'Listen again: هُوَ has a light ه from deep in the throat, and أَحَدٌ has a tight ح from the middle of the throat.' }
    ]
  };

  C.makharij.stones = C.ZONES;

  /* ================= NOON SAAKIN ISLAND ================= */
  var RULES = ['Izhar (clear)', 'Idgham (merge)', 'Iqlab (change)', 'Ikhfa (hide)'];

  C.noon = {
    id: 'noon',
    title: 'Noon Saakin Island',
    intro: 'What happens to نْ and tanween? It depends on the next letter! Learn the four rules, visit the four signs, then try the challenge.',
    welcome: 'Welcome to Noon Saakin Island! The four signs show the four rules of noon saakin and tanween. Read them, then find me at the pavilion with the orange roof.',
    stones: [
      { icon: '🔆', name: 'Izhar', translit: 'clear', letters: 'ء ه ع ح غ خ',
        desc: 'If a throat letter comes next, say the noon clearly, with no extra humming. Example: أَنْعَمْتَ.' },
      { icon: '🔗', name: 'Idgham', translit: 'merge', letters: 'ي ر م ل و ن',
        desc: 'If one of these letters starts the next word, the noon merges into it. With ي ن م و there is a ghunnah (hum). With ل ر there is no ghunnah. Example: مِّن رَّبِّهِمْ.' },
      { icon: '🔄', name: 'Iqlab', translit: 'change', letters: 'ب',
        desc: 'If ب comes next, the noon changes into a hidden meem, held with a ghunnah. Look for the small meem: مِنۢ بَعْدِ.' },
      { icon: '🌫️', name: 'Ikhfa', translit: 'hide', letters: 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
        desc: 'With the other 15 letters, the noon is hidden: half-way between clear and merged, with a ghunnah of 2 counts. Example: مِن شَرِّ.' }
    ],
    lessons: [
      {
        id: 'nn-intro', title: 'Noon Saakin & Tanween',
        note: 'Noon saakin (نْ) and tanween (ـً ـٍ ـٌ) follow the same 4 rules: Izhar, Idgham, Iqlab, Ikhfa. The rule depends on the letter that comes next.',
        pages: [
          { html: '<p><b>Noon saakin</b> is a noon with a sukoon: <span class="quran big">نْ</span>, as in <span class="quran">مِنْ</span> and <span class="quran">عَنْ</span>.</p>' +
              '<p><b>Tanween</b> sounds just like a noon saakin at the end of a word:</p>' +
              ex([['بٌ', '"bun"'], ['بٍ', '"bin"'], ['بًا', '"ban"']]) +
              '<p>So noon saakin and tanween follow <b>the same rules</b>. What we do depends on the <b>next letter</b>.</p>' },
          { html: '<p>There are <b>four rules</b>:</p>' +
              '<ul><li>🔆 <b>Izhar</b> (clear): 6 throat letters <span class="quran">ء ه ع ح غ خ</span></li>' +
              '<li>🔗 <b>Idgham</b> (merge): 6 letters <span class="quran">ي ر م ل و ن</span></li>' +
              '<li>🔄 <b>Iqlab</b> (change): 1 letter <span class="quran">ب</span></li>' +
              '<li>🌫️ <b>Ikhfa</b> (hide): the other 15 letters</li></ul>' +
              '<p>6 + 6 + 1 + 15 = <b>28</b>, every letter of the alphabet! Remember the throat letters from Makharij Isle? They come back now.</p>' }
        ]
      },
      {
        id: 'nn-izhar', title: 'Izhar: say it clearly',
        note: 'Izhar: before a throat letter (ء ه ع ح غ خ), say the noon clearly with no extra ghunnah. أَنْعَمْتَ, مِّنْ خَوْفٍ, نَارٌ حَامِيَةٌ.',
        pages: [
          { html: '<p><b>Izhar</b> means "to make clear". When a <b>throat letter</b> comes after noon saakin or tanween, say the noon <b>clearly</b>, with no extra humming.</p>' +
              '<div class="ayah quran">ء ه ع ح غ خ</div>' +
              '<p>Why? The noon comes from the tip of the tongue, and the throat letters are far away, so the noon stays clear.</p>' },
          { ayah: '001007', html: '<p>Examples:</p>' +
              ex([['أَنْعَمْتَ', '"an-ʿamta" · noon + ع'], ['مِّنْ خَوْفٍ', '"min khawf" · noon + خ'], ['نَارٌ حَامِيَةٌ', '"nārun ḥāmiyah" · tanween + ح']]) +
              '<p>Listen to the last ayah of Al-Fatiha and hear the clear noon in <span class="quran">أَنْعَمْتَ</span>.</p>' }
        ]
      },
      {
        id: 'nn-idgham', title: 'Idgham: merge it',
        note: 'Idgham: before ي ر م ل و ن in the next word, the noon merges. With ghunnah: ي ن م و. Without ghunnah: ل ر. Inside one word (ٱلدُّنْيَا) the noon stays clear.',
        pages: [
          { html: '<p><b>Idgham</b> means "to merge". The six letters are <span class="quran big">ي ر م ل و ن</span>. When one of them starts the <b>next word</b>, the noon disappears into it.</p>' +
              '<p>🔴 <b>With ghunnah</b> (hold the hum for 2 counts): <span class="quran">ي ن م و</span></p>' +
              ex([['[r]فَمَن يَعْمَلْ[/r]', '"fa-may-yaʿmal"'], ['[r]خَيْرًا يَرَهُۥ[/r]', '"khayray-yarah"']]) },
          { ayah: '104001', html: '<p>⚫ <b>Without ghunnah</b> (a clean merge): <span class="quran">ل ر</span></p>' +
              ex([['مِّن رَّبِّهِمْ', '"mir-rabbihim"'], ['وَيْلٌ لِّكُلِّ', '"waylul-likulli"']]) +
              '<p>Listen to Surah Al-Humazah: <span class="quran">وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ</span></p>' },
          { html: '<p>🔵 <b>Tricky!</b> Idgham only happens across <b>two words</b>. If the noon and the letter are in the <b>same word</b>, read the noon clearly. There are only four such words in the Quran:</p>' +
              '<div class="ayah quran">[b]ٱلدُّنْيَا[/b] · [b]صِنْوَانٌ[/b] · [b]قِنْوَانٌ[/b] · [b]بُنْيَٰنٌ[/b]</div>' }
        ]
      },
      {
        id: 'nn-iqlab', title: 'Iqlab: change it',
        note: 'Iqlab: before ب, the noon changes into a meem with a 2-count ghunnah. Look for the small meem: مِنۢ بَعْدِ, لَيُنۢبَذَنَّ.',
        pages: [
          { ayah: '104004', html: '<p><b>Iqlab</b> means "to change". Only one letter causes it: <span class="quran big">ب</span>.</p>' +
              '<p>The noon <b>changes into a meem</b>. Your lips gently close, and you hold a ghunnah for <b>2 counts</b>. In the mushaf you will see a <b>small meem</b> <span class="quran big">ۢ</span> on top.</p>' +
              ex([['[r]مِنۢ بَعْدِ[/r]', '"mim-baʿdi"'], ['[r]لَيُنۢبَذَنَّ[/r]', '"la-yumbadhanna"']]) +
              '<p>Iqlab works even inside one word, like <span class="quran">لَيُنۢبَذَنَّ</span> in Surah Al-Humazah. Listen!</p>' }
        ]
      },
      {
        id: 'nn-ikhfa', title: 'Ikhfa: hide it',
        note: 'Ikhfa: before the other 15 letters, the noon is hidden with a 2-count ghunnah, and the mouth gets ready for the next letter. مِن شَرِّ, أَنزَلْنَٰهُ, كُنتُمْ.',
        pages: [
          { html: '<p><b>Ikhfa</b> means "to hide". With the other <b>15 letters</b>, the noon is not fully said and not fully merged. It is <b>hidden</b>, with a ghunnah of <b>2 counts</b>.</p>' +
              '<div class="ayah quran">ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك</div>' +
              '<p>The tongue doesn\'t press for the noon. Instead, the mouth gets ready for the next letter while you hum through your nose.</p>' },
          { ayah: '113002', html: ex([['[r]مِن شَرِّ[/r]', '"min sharri"'], ['[r]أَنزَلْنَٰهُ[/r]', '"anzalnāhu"'], ['[r]كُنتُمْ[/r]', '"kuntum"']]) +
              '<p>🔴 The red shows the ghunnah you hold. Listen to Surah Al-Falaq: <span class="quran">مِن شَرِّ مَا خَلَقَ</span></p>' +
              '<p><b>Easy trick:</b> if the next letter is not a throat letter, not one of <span class="quran">ي ر م ل و ن</span>, and not <span class="quran">ب</span>, then it is <b>Ikhfa</b>!</p>' }
        ]
      }
    ],

    challenge: [
      { prompt: 'Which rule is in this word?', arabic: '[h]أَنْعَمْتَ[/h]', ar: false, options: RULES, answer: 0,
        explain: 'نْ is followed by ع, a throat letter, so it is Izhar: say the noon clearly.' },
      { prompt: 'Which rule is in these words?', arabic: '[h]مِّن رَّبِّهِمْ[/h]', ar: false, options: RULES, answer: 1,
        explain: 'The noon is followed by ر in the next word, so it is Idgham without ghunnah: "mir-rabbihim".' },
      { prompt: 'Which rule is in these words?', arabic: '[h]مِنۢ بَعْدِ[/h]', ar: false, options: RULES, answer: 2,
        explain: 'The noon is followed by ب, so it is Iqlab: the noon becomes a meem with a ghunnah. See the small meem!' },
      { prompt: 'Which rule is in these words?', arabic: '[h]مِن شَرِّ[/h]', ar: false, options: RULES, answer: 3,
        explain: 'ش is one of the 15 ikhfa letters, so the noon is hidden with a ghunnah.' },
      { prompt: 'Which rule is in these words?', arabic: '[h]مِّن جُوعٍ[/h]', ar: false, options: RULES, answer: 3,
        explain: 'ج is an ikhfa letter. This is from Surah Quraysh: أَطْعَمَهُم مِّن جُوعٍ.' },
      { prompt: 'Which rule is in these words?', arabic: '[h]وَيْلٌ لِّكُلِّ[/h]', ar: false, options: RULES, answer: 1,
        explain: 'The tanween is followed by ل, so it is Idgham without ghunnah: "waylul-likulli".' },
      { prompt: 'How many throat letters cause Izhar?', ar: false, options: ['6', '4', '15'], answer: 0,
        explain: 'Six throat letters: ء ه ع ح غ خ.' },
      { prompt: 'Which letter causes Iqlab?', options: ['ب', 'م', 'ن', 'ل'], answer: 0,
        explain: 'Only ب causes Iqlab.' },
      { prompt: 'Which two letters merge WITHOUT ghunnah?', options: ['ل ر', 'ي و', 'ن م'], answer: 0,
        explain: 'ل and ر merge without ghunnah. ي ن م و merge with ghunnah.' },
      { prompt: 'In ٱلدُّنْيَا the noon and ي are in the same word. What do we do?', ar: false,
        options: ['Read the noon clearly', 'Merge it with ghunnah', 'Change it into a meem'], answer: 0,
        explain: 'Idgham only happens across two words. Inside one word, as in ٱلدُّنْيَا, the noon is read clearly.' },
      { type: 'listen', prompt: 'Listen carefully. Which ayah did you hear?', audio: '099007',
        options: ['فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُۥ', 'وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُۥ', 'مِن شَرِّ مَا خَلَقَ'], answer: 0,
        explain: 'That was Surah Az-Zalzalah, ayah 7. Hear the idgham with ghunnah in فَمَن يَعْمَلْ and خَيْرًا يَرَهُۥ.' },
      { type: 'record', prompt: 'Listen, then record yourself. Merge the tanween into ل with no ghunnah!',
        arabic: '[b]وَيْلٌ لِّكُلِّ[/b] [b]هُمَزَةٍ لُّمَزَةٍ[/b]', audio: '104001',
        explain: 'Read "waylul-likulli humazatil-lumazah": the tanween disappears straight into the ل both times.' }
    ]
  };

  /* ================= MEEM SAAKIN ISLAND ================= */
  var MRULES = ['Ikhfa Shafawi (hide)', 'Idgham Shafawi (merge)', 'Izhar Shafawi (clear)'];

  C.meem = {
    id: 'meem',
    title: 'Meem Saakin Island',
    intro: 'Meem saakin (مْ) has only three rules, and they all happen at the lips! Read the three signs, learn the lessons, then try the challenge.',
    welcome: 'Welcome to Meem Saakin Island! There are only three signs here, because meem saakin has three rules. Read them, then find me at the pavilion with the pink roof.',
    stones: [
      { icon: '🫧', name: 'Ikhfa Shafawi', translit: 'hide at the lips', letters: 'ب',
        desc: 'If ب comes after مْ, hide the meem: the lips touch gently and you hold a ghunnah for 2 counts. Example: تَرْمِيهِم بِحِجَارَةٍ.' },
      { icon: '🔗', name: 'Idgham Shafawi', translit: 'merge at the lips', letters: 'م',
        desc: 'If another م comes after مْ, the two meems merge into one doubled meem with a ghunnah of 2 counts. Example: أَطْعَمَهُم مِّن جُوعٍ.' },
      { icon: '🔆', name: 'Izhar Shafawi', translit: 'clear at the lips', letters: 'All other letters',
        desc: 'With every other letter, say the meem clearly by closing the lips, with no extra ghunnah. Be extra careful before و and ف! Example: أَلَمْ تَرَ.' }
    ],
    lessons: [
      {
        id: 'mm-intro', title: 'Meem Saakin',
        note: 'Meem saakin (مْ) has 3 rules: Ikhfa Shafawi (before ب), Idgham Shafawi (before م), Izhar Shafawi (before all other letters). "Shafawi" means "of the lips".',
        pages: [
          { html: '<p><b>Meem saakin</b> is a meem with a sukoon: <span class="quran big">مْ</span>, as in <span class="quran">لَهُمْ</span> and <span class="quran">أَلَمْ</span>.</p>' +
              '<p>Noon saakin had four rules, but meem saakin has only <b>three</b>. Easier!</p>' +
              '<ul><li>🫧 <b>Ikhfa Shafawi</b> (hide): before <span class="quran">ب</span></li>' +
              '<li>🔗 <b>Idgham Shafawi</b> (merge): before <span class="quran">م</span></li>' +
              '<li>🔆 <b>Izhar Shafawi</b> (clear): before all the other letters</li></ul>' },
          { html: '<p>Why "<b>Shafawi</b>"? It means "of the <b>lips</b>". Remember Makharij Isle? The meem comes from the lips, and so does <span class="quran">ب</span>.</p>' +
              ex([['م', 'lips close'], ['ب', 'lips close'], ['و', 'lips round'], ['ف', 'lip + teeth']]) +
              '<p>Because these letters are neighbours, the meem behaves differently with each of them.</p>' }
        ]
      },
      {
        id: 'mm-ikhfa', title: 'Ikhfa Shafawi: hide at the lips',
        note: 'Ikhfa Shafawi: مْ before ب. The lips touch gently, with a 2-count ghunnah. تَرْمِيهِم بِحِجَارَةٍ (Surah Al-Fil).',
        pages: [
          { ayah: '105004', html: '<p>When <span class="quran big">ب</span> comes after <span class="quran">مْ</span>, the meem is <b>hidden</b>. Let your lips touch <b>gently</b> (don\'t press hard) and hold a <b>ghunnah for 2 counts</b>.</p>' +
              ex([['[r]تَرْمِيهِم بِحِجَارَةٍ[/r]', '"tarmīhim bi-ḥijārah"']]) +
              '<p>This is from <b>Surah Al-Fil</b>: the birds threw stones of baked clay at the army of the elephant. Listen!</p>' +
              '<p>🔵 Notice that the meem in <span class="quran">تَرْمِيهِم</span> has <b>no sukoon</b> drawn on it. In the mushaf, that is a hint that it is hidden.</p>' }
        ]
      },
      {
        id: 'mm-idgham', title: 'Idgham Shafawi: merge at the lips',
        note: 'Idgham Shafawi: مْ before م. The two meems become one doubled meem with a 2-count ghunnah. أَطْعَمَهُم مِّن جُوعٍ (Surah Quraysh).',
        pages: [
          { ayah: '106004', html: '<p>When another <span class="quran big">م</span> comes after <span class="quran">مْ</span>, the two meems <b>merge</b> into one doubled meem (you can see the shaddah on the second one), with a <b>ghunnah of 2 counts</b>.</p>' +
              ex([['[r]أَطْعَمَهُم مِّن[/r]', '"aṭʿamahum-min"'], ['[r]لَهُم مَّا[/r]', '"lahum-mā"']]) +
              '<p>Listen to <b>Surah Quraysh</b>, ayah 4. It has idgham shafawi <b>twice</b>: <span class="quran">أَطْعَمَهُم مِّن</span> and <span class="quran">وَءَامَنَهُم مِّنْ</span>.</p>' }
        ]
      },
      {
        id: 'mm-izhar', title: 'Izhar Shafawi: clear at the lips',
        note: 'Izhar Shafawi: مْ before any other letter. Close the lips clearly, with no extra ghunnah. Take extra care before و and ف: عَلَيْهِمْ وَلَا, أَلَمْ تَرَ.',
        pages: [
          { ayah: '105001', html: '<p>With <b>every other letter</b>, say the meem <b>clearly</b>: close your lips for the meem, then move on, with no extra humming.</p>' +
              ex([['أَلَمْ تَرَ', '"alam tara"'], ['أَلَمْ يَجْعَلْ', '"alam yajʿal"']]) +
              '<p>Surah Al-Fil begins with izhar shafawi: <span class="quran">أَلَمْ تَرَ</span>. Listen!</p>' },
          { html: '<p>🔵 <b>Tricky!</b> Be extra careful before <span class="quran big">و</span> and <span class="quran big">ف</span>. They are lip letters too, so it is easy to hide the meem by mistake. Keep it clear!</p>' +
              ex([['[b]عَلَيْهِمْ وَلَا[/b]', 'Al-Fatiha, ayah 7'], ['[b]هُمْ فِيهَا[/b]', '"hum fīhā"']]) +
              '<p>You recite <span class="quran">عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ</span> in every rakʿah, so practise saying that meem clearly!</p>' }
        ]
      }
    ],

    challenge: [
      { prompt: 'Which rule is in these words?', arabic: '[h]تَرْمِيهِم بِحِجَارَةٍ[/h]', ar: false, options: MRULES, answer: 0,
        explain: 'مْ is followed by ب, so it is Ikhfa Shafawi: lips touch gently with a 2-count ghunnah.' },
      { prompt: 'Which rule is in these words?', arabic: '[h]أَطْعَمَهُم مِّن[/h]', ar: false, options: MRULES, answer: 1,
        explain: 'مْ is followed by another م, so the two merge: Idgham Shafawi with ghunnah.' },
      { prompt: 'Which rule is in these words?', arabic: '[h]أَلَمْ تَرَ[/h]', ar: false, options: MRULES, answer: 2,
        explain: 'مْ is followed by ت, which is not ب or م, so it is Izhar Shafawi: say the meem clearly.' },
      { prompt: 'Which rule is in these words?', arabic: '[h]عَلَيْهِمْ وَلَا[/h]', ar: false, options: MRULES, answer: 2,
        explain: 'مْ is followed by و, so it is Izhar Shafawi. Be extra careful to keep the meem clear before و!' },
      { prompt: 'Which rule is in these words?', arabic: '[h]لَهُم مَّا[/h]', ar: false, options: MRULES, answer: 1,
        explain: 'مْ followed by م: Idgham Shafawi. You can see the shaddah on the second meem.' },
      { prompt: 'Which letter after مْ causes Ikhfa Shafawi?', options: ['ب', 'م', 'و', 'ف'], answer: 0,
        explain: 'Only ب causes Ikhfa Shafawi.' },
      { prompt: 'Why are these rules called "Shafawi"?', ar: false,
        options: ['Because the meem comes from the lips', 'Because the meem comes from the throat', 'Because the meem is stretched'], answer: 0,
        explain: 'Shafawi means "of the lips". The meem comes from the lips.' },
      { prompt: 'Before which two letters must you take extra care to keep the meem clear?', options: ['و ف', 'ب م', 'ق ك'], answer: 0,
        explain: 'و and ف are also lip letters, so it is easy to hide the meem before them by mistake.' },
      { prompt: 'How long is the ghunnah in Ikhfa Shafawi and Idgham Shafawi?', ar: false,
        options: ['2 counts', '6 counts', 'There is no ghunnah'], answer: 0,
        explain: 'Both have a ghunnah of 2 counts.' },
      { type: 'listen', prompt: 'Listen carefully. Which ayah of Surah Al-Fil did you hear?', audio: '105001',
        options: ['أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَٰبِ ٱلْفِيلِ', 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِى تَضْلِيلٍ', 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ'], answer: 0,
        explain: 'That was ayah 1: "Alam tara kayfa faʿala rabbuka bi-aṣḥābil-fīl". It starts with izhar shafawi in أَلَمْ تَرَ.' },
      { type: 'record', prompt: 'Listen, then record yourself. Hide the meem before ب with a gentle ghunnah!',
        arabic: '[r]تَرْمِيهِم بِ[/r]حِجَارَةٍ [r]مِّن سِ[/r]جِّيلٍ', audio: '105004',
        explain: 'In تَرْمِيهِم بِحِجَارَةٍ, let the lips touch softly and hum for 2 counts before the ب.' }
    ]
  };

  /* ================= QALQALAH CLIFFS ================= */
  var QRULES = ['Minor qalqalah (Sughra)', 'Major qalqalah (Kubra)', 'No qalqalah'];

  C.qalqalah = {
    id: 'qalqalah',
    title: 'Qalqalah Cliffs',
    intro: 'Qalqalah means an echo or a bounce. Five letters bounce when they have a sukoon: قُطْبُ جَدٍّ. Read the five stones, learn the lessons, then take the exam.',
    welcome: 'Welcome to Qalqalah Cliffs! Can you hear how the waves echo off the cliffs? Five letters in the Quran echo too. There is a stone for each one. Read them, then find me at the pavilion with the blue roof.',
    stones: [
      { icon: '🪨', name: 'ق Qaaf', translit: 'deep at the back of the tongue', letters: 'ق',
        desc: 'Qaaf with a sukoon bounces. The very first word revealed of the Quran has it: ٱقْرَأْ (Surah Al-ʿAlaq).' },
      { icon: '🪨', name: 'ط Ṭaa', translit: 'tip of the tongue, heavy', letters: 'ط',
        desc: 'Ṭaa with a sukoon bounces, full and heavy. You met it on Meem Island: أَطْعَمَهُم مِّن جُوعٍ (Surah Quraysh).' },
      { icon: '🪨', name: 'ب Baa', translit: 'the lips', letters: 'ب',
        desc: 'Baa with a sukoon bounces at the lips. Example: ٱلْأَبْتَرُ (Surah Al-Kawthar).' },
      { icon: '🪨', name: 'ج Jeem', translit: 'middle of the tongue', letters: 'ج',
        desc: 'Jeem with a sukoon bounces. Example: أَلَمْ يَجْعَلْ (Surah Al-Fil).' },
      { icon: '🪨', name: 'د Daal', translit: 'tip of the tongue, light', letters: 'د',
        desc: 'Daal with a sukoon bounces. Surah Al-Ikhlas is full of it: لَمْ يَلِدْ وَلَمْ يُولَدْ.' }
    ],
    lessons: [
      {
        id: 'qq-intro', title: 'What is Qalqalah?',
        note: 'Qalqalah = an echo or bounce. 5 letters: ق ط ب ج د, remembered as قُطْبُ جَدٍّ ("quṭbu jadd"). They bounce only when they have a sukoon.',
        pages: [
          { html: '<p><b>Qalqalah</b> means a <b>shake</b>, <b>echo</b> or <b>bounce</b>. Some letters are so strong that when they stop, they bounce a little, like a ball hitting the ground.</p>' +
              '<p>There are <b>five</b> qalqalah letters:</p>' +
              ex([['ق', 'Qaaf'], ['ط', 'Ṭaa'], ['ب', 'Baa'], ['ج', 'Jeem'], ['د', 'Daal']]) },
          { html: '<p>To remember them, put them together into two words:</p>' +
              '<p style="text-align:center"><span class="quran big">قُطْبُ جَدٍّ</span><br>"quṭbu jadd"</p>' +
              '<p>⚠️ They only bounce when they have a <b>sukoon</b> (either written, or because you stop on them). With a fatha, kasra or damma, they are read normally.</p>' +
              ex([['ٱقْرَأْ', 'ق has sukoon: bounce!'], ['قُلْ', 'ق has damma: no bounce']]) }
        ]
      },
      {
        id: 'qq-sughra', title: 'Minor Qalqalah (Sughra)',
        note: 'Minor qalqalah (Sughra): the letter has a sukoon in the MIDDLE of a word or ayah. A light bounce. ٱقْرَأْ, يَجْعَلْ, أَطْعَمَهُم, ٱلْأَبْتَرُ, يَلِدْ.',
        pages: [
          { ayah: '096001', html: '<p><b>Minor qalqalah</b> (<i>Sughra</i>) is when a qalqalah letter has a sukoon in the <b>middle</b> of a word or an ayah. Give it a <b>light</b> bounce and keep going.</p>' +
              ex([['ٱ[h]قْ[/h]رَأْ', '"iq-ra\'"'], ['يَ[h]جْ[/h]عَلْ', '"yaj-ʿal"'], ['أَ[h]طْ[/h]عَمَهُم', '"aṭ-ʿamahum"'], ['ٱلْأَ[h]بْ[/h]تَرُ', '"al-ab-tar"']]) +
              '<p>The very first word Jibreel brought to the Prophet ﷺ in the cave of Ḥirāʾ was <span class="quran">ٱقْرَأْ</span>, "Read!", and it has a qalqalah. Listen!</p>' }
        ]
      },
      {
        id: 'qq-kubra', title: 'Major Qalqalah (Kubra)',
        note: 'Major qalqalah (Kubra): you STOP on a qalqalah letter, usually at the end of an ayah. A stronger bounce. أَحَدْ, ٱلصَّمَدْ, ٱلْفَلَقْ. Strongest with a shaddah: وَتَبّْ.',
        pages: [
          { ayah: '112001', html: '<p><b>Major qalqalah</b> (<i>Kubra</i>) is when you <b>stop</b> on a qalqalah letter, usually at the end of an ayah. When you stop, the letter gets a sukoon, so it bounces, and the bounce is <b>stronger</b>.</p>' +
              ex([['أَحَ[h]د[/h]ٌ', 'stop: "aḥad"'], ['ٱلصَّمَ[h]د[/h]ُ', 'stop: "aṣ-ṣamad"'], ['ٱلْفَلَ[h]ق[/h]ِ', 'stop: "al-falaq"']]) +
              '<p><b>Surah Al-Ikhlas</b> is full of qalqalah! Listen to ayah 1 and hear the bounce on أَحَدْ.</p>' },
          { ayah: '111001', html: '<p>When the letter you stop on has a <b>shaddah</b>, the bounce is the <b>strongest</b> of all.</p>' +
              ex([['وَتَ[h]بَّ[/h]', 'stop: "wa tabb"'], ['ٱلْحَ[h]قِّ[/h]', 'stop: "al-ḥaqq"']]) +
              '<p>Listen to Surah Al-Masad, ayah 1:</p>' +
              '<p style="text-align:center"><span class="quran big">تَبَّتْ يَدَ[r]آ[/r] أَبِى لَهَبٍ وَ[h]تَبَّ[/h]</span></p>' +
              '<p>🔴 The red <span class="quran c-red">آ</span> is stretched. Then stop on <span class="quran">وَتَبَّ</span> with the strongest bounce.</p>' }
        ]
      },
      {
        id: 'qq-careful', title: 'Careful Bounces',
        note: 'Tricky: the bounce has NO vowel. Say "aḥad", not "aḥadu" or "aḥada". And if you do not stop, a letter with a harakah does not bounce: خَلَقَ ٱلْإِنسَٰنَ.',
        pages: [
          { html: '<p>🔵 <b>Tricky!</b> The bounce is a quick echo with <b>no vowel</b> in it. Don\'t turn it into a fatha or a damma!</p>' +
              ex([['[b]أَحَدْ[/b]', '✅ "aḥad"'], ['[b]أَحَدْ[/b]', '❌ "aḥadu" / "aḥada"']]) +
              '<p>Let the letter bounce, then let it go.</p>' },
          { ayah: '096002', html: '<p>🔵 <b>Tricky!</b> Major qalqalah only happens when you <b>stop</b>. If you keep reading, the letter keeps its harakah and does not bounce.</p>' +
              ex([['[b]خَلَقَ[/b] ٱلْإِنسَٰنَ', 'keep going: "khalaqal-insān", no bounce'], ['ٱلَّذِى [b]خَلَقَ[/b]', 'stop: "khalaq", bounce!']]) +
              '<p>Listen to Surah Al-ʿAlaq, ayah 2.</p>' },
          { ayah: '113003', html: '<p>🎨 <b>Bounce or hold?</b> A qalqalah is a quick <b>bounce</b>, not a hold, so a bouncing letter is never red. Don\'t stretch it!</p>' +
              '<p>But red can be in the same ayah. In Surah Al-Falaq, ayah 3, the noon in <span class="quran">مِن شَرِّ</span> is hidden with a ghunnah (<span class="c-red">red</span>: hold it). Then you stop on <span class="quran">وَقَبَ</span> with a bounce (<span class="c-blue">blue</span>: tricky, don\'t add a vowel!):</p>' +
              '<p style="text-align:center"><span class="quran big">وَ[r]مِن شَ[/r]رِّ غَاسِقٍ إِذَا [b]وَقَبَ[/b]</span></p>' }
        ]
      }
    ],

    challenge: [
      { prompt: 'Which group is the five qalqalah letters?', options: ['ق ط ب ج د', 'ق ك ت ج د', 'ب م و ف ن'], answer: 0,
        explain: 'The qalqalah letters are ق ط ب ج د: قُطْبُ جَدٍّ.' },
      { prompt: 'What does "qalqalah" mean?', ar: false,
        options: ['An echo or bounce', 'A hum through the nose', 'Stretching a letter'], answer: 0,
        explain: 'Qalqalah means a shake, echo or bounce.' },
      { prompt: 'When does a qalqalah letter bounce?', ar: false,
        options: ['When it has a sukoon', 'When it has a fatha', 'When it has a kasra'], answer: 0,
        explain: 'Only with a sukoon, either written or because you stop on the letter.' },
      { prompt: 'Which word has a qalqalah?', options: ['ٱقْرَأْ', 'ٱلْحَمْدُ', 'مِنْ'], answer: 0,
        explain: 'In ٱقْرَأْ the ق has a sukoon, so it bounces.' },
      { prompt: 'Which type of qalqalah is in the highlighted word?', arabic: 'أَلَمْ [h]يَجْعَلْ[/h] كَيْدَهُمْ', ar: false, options: QRULES, answer: 0,
        explain: 'The ج has a sukoon in the middle of the word: Minor qalqalah (Sughra).' },
      { prompt: 'You stop at the end of this ayah. Which type of qalqalah is in the highlighted word?', arabic: 'قُلْ هُوَ ٱللَّهُ [h]أَحَدٌ[/h]', ar: false, options: QRULES, answer: 1,
        explain: 'You stop on the د, so it bounces strongly: Major qalqalah (Kubra).' },
      { prompt: 'You keep reading without stopping. Does the ق in the highlighted word bounce?', arabic: '[h]خَلَقَ[/h] ٱلْإِنسَٰنَ مِنْ عَلَقٍ', ar: false, options: QRULES, answer: 2,
        explain: 'The ق in خَلَقَ has a fatha, and you are not stopping, so there is no qalqalah.' },
      { prompt: 'Which type of qalqalah is in the highlighted word?', arabic: 'لَمْ [h]يَلِدْ[/h] وَلَمْ يُولَدْ', ar: false, options: QRULES, answer: 0,
        explain: 'The د in يَلِدْ has a sukoon in the middle of the ayah: Minor qalqalah (Sughra).' },
      { prompt: 'Which letter bounces in this word?', arabic: '[h]أَطْعَمَهُم[/h] مِّن جُوعٍ', options: ['ط', 'ع', 'م', 'ه'], answer: 0,
        explain: 'ط is a qalqalah letter and it has a sukoon in أَطْعَمَهُم.' },
      { prompt: 'How should the bounce on أَحَدْ sound?', ar: false,
        options: ['A quick bounce with no vowel: "aḥad"', 'With a vowel at the end: "aḥadu"', 'Hummed through the nose'], answer: 0,
        explain: 'The bounce has no vowel. Say "aḥad", not "aḥadu".' },
      { type: 'listen', prompt: 'Listen carefully. Which ayah of Surah Al-Ikhlas did you hear?', audio: '112003',
        options: ['لَمْ يَلِدْ وَلَمْ يُولَدْ', 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ'], answer: 0,
        explain: 'That was ayah 3: "Lam yalid wa lam yūlad", with a minor qalqalah on يَلِدْ and a major one on يُولَدْ when you stop.' },
      { type: 'record', prompt: 'Listen, then record yourself. Stop at the end and bounce the ق!',
        arabic: 'قُلْ أَعُوذُ بِرَبِّ [b]ٱلْفَلَقِ[/b]', audio: '113001',
        explain: 'Stop on ٱلْفَلَقْ and let the ق bounce, with no vowel after it.' }
    ]
  };

  /* ================= MADD DESERT ================= */
  var MADDS = ['Natural (Tabeeʿi)', 'Connected (Muttasil)', 'Separated (Munfasil)', 'Necessary (Lazim)', 'Stopping (ʿArid)'];

  C.madd = {
    id: 'madd',
    title: 'Madd Desert',
    intro: 'Madd means stretching, and this desert stretches as far as the eye can see! Read the five stones, learn the lessons, then take the exam. Watch for red: red means stretch!',
    welcome: 'Welcome to Madd Desert! It is hot, so stay near the oasis. There is a stone for each of the five kinds of madd. Read them, then find me at the pavilion with the red roof.',
    stones: [
      { icon: '🐪', name: 'Natural Madd', translit: 'Madd Ṭabīʿī · 2 counts', letters: 'ا و ي',
        desc: 'A madd letter with no hamza and no sukoon after it. Stretch exactly 2 counts, like a camel\'s steady step: قَالَ, يَقُولُ, قِيلَ.' },
      { icon: '🔗', name: 'Madd Muttasil', translit: 'connected · 4 or 5 counts', letters: 'madd letter + ء in the same word',
        desc: 'A hamza comes after the madd letter in the same word. You must stretch it 4 or 5 counts: جَآءَ, ٱلسَّمَآءِ.' },
      { icon: '🌉', name: 'Madd Munfasil', translit: 'separated · 4 or 5 counts', letters: 'madd letter, then ء in the next word',
        desc: 'The madd letter ends one word and a hamza starts the next. Stretch it 4 or 5 counts: إِنَّآ أَعْطَيْنَٰكَ.' },
      { icon: '⛰️', name: 'Madd Lazim', translit: 'necessary · 6 counts', letters: 'madd letter + sukoon or shaddah',
        desc: 'A sukoon or shaddah that is always there comes after the madd letter. Always 6 counts: ٱلضَّآلِّينَ, and نٓ at the start of Surah Al-Qalam.' },
      { icon: '🛑', name: 'Madd ʿArid', translit: 'stopping · 2, 4 or 6 counts', letters: 'madd letter + the letter you stop on',
        desc: 'When you stop on a word and a madd letter is right before the last letter, you may stretch 2, 4 or 6 counts: ٱلرَّحِيمْ.' }
    ],
    lessons: [
      {
        id: 'md-intro', title: 'What is Madd?',
        note: 'Madd = stretching. The madd letters: ا after a fatha, و with sukoon after a damma, ي with sukoon after a kasra. One count ≈ the time to fold one finger. The Prophet ﷺ stretched his recitation (Bukhari).',
        pages: [
          { html: '<p><b>Madd</b> means <b>stretching</b> a sound. It happens on the three <b>madd letters</b>:</p>' +
              ex([['قَ[r]ا[/r]لَ', 'ا after a fatha'], ['يَقُ[r]و[/r]لُ', 'وْ after a damma'], ['قِ[r]ي[/r]لَ', 'يْ after a kasra']]) +
              '<p>🔴 They are <span class="c-red">red</span> because you stretch them. Remember the Color Code!</p>' },
          { html: '<p>🔵 <b>Tricky!</b> Sometimes the alif is a tiny <b>dagger alif</b> written above the letter. It is still a madd letter!</p>' +
              ex([['[b]ٱلرَّحْمَٰنِ[/b]', '"ar-raḥmān"'], ['[b]مَٰلِكِ[/b]', '"mālik"']]) },
          { html: '<p>We measure madd in <b>counts</b> (ḥarakāt). One count is about the time it takes to <b>fold one finger</b> at a steady pace.</p>' +
              ex([['2', 'Natural'], ['4–5', 'with a hamza'], ['6', 'Necessary'], ['2 · 4 · 6', 'when stopping']]) +
              '<p>Anas رضي الله عنه was asked how the Prophet ﷺ recited. He said his recitation had <b>madd</b>, and then recited <span class="quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>, stretching ٱللَّه, ٱلرَّحْمَٰن and ٱلرَّحِيم. (Bukhari)</p>' }
        ]
      },
      {
        id: 'md-natural', title: 'Natural Madd: 2 counts',
        note: 'Natural madd (Ṭabīʿī): a madd letter with no hamza or sukoon after it = exactly 2 counts. Don\'t stretch it more! قَالَ, يَقُولُ, مَٰلِكِ.',
        pages: [
          { ayah: '001004', html: '<p>A madd letter with <b>no hamza and no sukoon</b> after it is a <b>natural madd</b>. Stretch it exactly <b>2 counts</b>. It is called "natural" because without it the word would be broken.</p>' +
              ex([['قَ[r]ا[/r]لَ', '"qāla"'], ['فِ[r]ي[/r]هِ', '"fīhi"'], ['[r]مَٰ[/r]لِكِ', '"māliki"']]) +
              '<p>Listen to Al-Fatiha, ayah 4. Hear the steady 2 counts in <span class="quran">مَٰلِكِ</span>.</p>' },
          { html: '<p>🔵 <b>Tricky!</b> Natural madd is <b>exactly</b> 2 counts. Not shorter, and not longer!</p>' +
              ex([['[b]قَالَ[/b]', '✅ "qāla"'], ['[b]قَالَ[/b]', '❌ "qaaaaala" · too long'], ['[b]قَالَ[/b]', '❌ "qala" · too short']]) }
        ]
      },
      {
        id: 'md-hamza', title: 'Madd with a Hamza: 4 or 5',
        note: 'Hamza after a madd letter: in the SAME word = Muttasil (must stretch 4 or 5): جَآءَ. In the NEXT word = Munfasil (4 or 5): إِنَّآ أَعْطَيْنَٰكَ. Look for the wavy madda sign ٓ.',
        pages: [
          { ayah: '110001', html: '<p>When a <b>hamza (ء)</b> comes after a madd letter, the madd gets longer: <b>4 or 5 counts</b>. Look for the wavy <b>madda sign</b> <span class="quran big c-red">ٓ</span> on top!</p>' +
              '<p>🔗 <b>Madd Muttasil</b> (connected): the hamza is in the <b>same word</b>. You <b>must</b> stretch it.</p>' +
              ex([['جَ[r]آ[/r]ءَ', '"jāāāʾa"'], ['ٱلسَّمَ[r]آ[/r]ءِ', '"as-samāāāʾi"'], ['سُ[r]وٓ[/r]ءَ', '"sūūūʾa"']]) +
              '<p>Listen to Surah An-Naṣr: <span class="quran">إِذَا جَآءَ نَصْرُ ٱللَّهِ</span>.</p>' },
          { ayah: '108001', html: '<p>🌉 <b>Madd Munfasil</b> (separated): the madd letter is at the <b>end of one word</b>, and the hamza starts the <b>next word</b>. In the way most of the world recites (Ḥafṣ), stretch it <b>4 or 5</b> counts.</p>' +
              ex([['إِنَّ[r]آ[/r] أَعْطَيْنَٰكَ', '"innāāā aʿṭaynāk"'], ['[r]يَٰٓ[/r]أَيُّهَا', '"yāāā ayyuhā"'], ['بِمَ[r]آ[/r] أُنزِلَ', '"bimāāā unzila"']]) +
              '<p>Listen to the start of Surah Al-Kawthar.</p>' }
        ]
      },
      {
        id: 'md-lazim', title: 'Necessary Madd: 6 counts',
        note: 'Madd Lazim: a madd letter followed by a sukoon or shaddah that is always there = 6 counts, always. ٱلضَّآلِّينَ, ٱلطَّآمَّةُ, and letters at the start of surahs: نٓ, الٓمٓ.',
        pages: [
          { ayah: '001007', html: '<p>⛰️ When a madd letter is followed by a <b>shaddah</b> or a <b>sukoon</b> that is always there, it is <b>Madd Lazim</b>, the longest madd: <b>6 counts</b>, always.</p>' +
              ex([['ٱلضَّ[r]آ[/r]لِّينَ', 'Al-Fatiha 7'], ['ٱلطَّ[r]آ[/r]مَّةُ', 'An-Nāziʿāt 34'], ['ٱلْحَ[r]آ[/r]قَّةُ', 'Al-Ḥāqqah 1']]) +
              '<p>You say <span class="quran">ٱلضَّآلِّينَ</span> in every rakʿah. Listen and count to 6!</p>' },
          { ayah: '068001', html: '<p>Some surahs begin with <b>letters</b>. When a letter\'s name has a madd before a sukoon, that is also Madd Lazim: <b>6 counts</b>.</p>' +
              ex([['[r]نٓ[/r]', '"nūūūūūn" · Al-Qalam'], ['ا[r]لٓمٓ[/r]', '"alif lāāām mīīīm"']]) +
              '<p>🔴 Remember Ms. Afra\'s Color Code? The red <span class="quran c-red">نٓ</span> of Surah Al-Qalam was the very first red letter you learned. Now you know why: it is Madd Lazim!</p>' }
        ]
      },
      {
        id: 'md-arid', title: 'Stopping Madd: 2, 4 or 6',
        note: 'Madd ʿArid: stopping on a word with a madd letter right before the last letter = 2, 4 or 6 counts. ٱلرَّحِيمْ, ٱلْعَٰلَمِينْ, نَسْتَعِينْ. Pick one length and keep it the same.',
        pages: [
          { ayah: '001003', html: '<p>🛑 When you <b>stop</b> on a word, the last letter gets a sukoon. If a madd letter is right before it, you may stretch <b>2, 4 or 6</b> counts. This is <b>Madd ʿArid</b> ("passing", because the sukoon is only there when you stop).</p>' +
              ex([['ٱلرَّحِ[r]ي[/r]مِ', 'stop: "ar-raḥīīīm"'], ['ٱلْعَٰلَمِ[r]ي[/r]نَ', 'stop: "al-ʿālamīīīn"'], ['نَسْتَعِ[r]ي[/r]نُ', 'stop: "nastaʿīīīn"']]) +
              '<p>Al-Fatiha is full of it! Listen to ayah 3.</p>' },
          { html: '<p>🔵 <b>Tricky!</b> Choose one length (2, 4 or 6) and use the <b>same length</b> at every stop in your recitation. Don\'t do 2 at one stop and 6 at the next!</p>' +
              '<p>🔵 And if you <b>don\'t stop</b>, there is no ʿArid. It is just a natural madd of 2 counts:</p>' +
              ex([['[b]ٱلرَّحِيمِ مَٰلِكِ[/b]', 'joined: "ar-raḥīmi māliki"']]) }
        ]
      }
    ],

    challenge: [
      { prompt: 'Which are the three madd letters?', options: ['ا و ي', 'ق ط ب', 'م ن ل'], answer: 0,
        explain: 'The madd letters are ا (after a fatha), و (with sukoon after a damma) and ي (with sukoon after a kasra).' },
      { prompt: 'How many counts is a natural madd?', ar: false, options: ['2 counts', '4 counts', '6 counts'], answer: 0,
        explain: 'Natural madd is exactly 2 counts.' },
      { prompt: 'You keep reading without stopping. Which madd is on the highlighted letter?', arabic: 'قَ[h]ا[/h]لَ رَبِّ', ar: false, options: MADDS, answer: 0,
        explain: 'Nothing special comes after the alif (no hamza, no sukoon), so it is a natural madd of 2 counts.' },
      { prompt: 'Which madd is on the highlighted letter?', arabic: 'إِذَا جَ[h]آ[/h]ءَ نَصْرُ ٱللَّهِ', ar: false, options: MADDS, answer: 1,
        explain: 'The hamza comes after the madd letter in the same word جَآءَ: Madd Muttasil, 4 or 5 counts.' },
      { prompt: 'Which madd is on the highlighted letter?', arabic: 'إِنَّ[h]آ[/h] أَعْطَيْنَٰكَ ٱلْكَوْثَرَ', ar: false, options: MADDS, answer: 2,
        explain: 'The madd letter ends إِنَّآ and the hamza starts the next word: Madd Munfasil, 4 or 5 counts.' },
      { prompt: 'Which madd is on the highlighted letter?', arabic: 'وَلَا ٱلضَّ[h]آ[/h]لِّينَ', ar: false, options: MADDS, answer: 3,
        explain: 'After the alif comes a shaddah (لّ) that is always there: Madd Lazim, 6 counts.' },
      { prompt: 'You stop at the end of this ayah. Which madd is on the highlighted letter?', arabic: 'ٱلرَّحْمَٰنِ ٱلرَّحِ[h]ي[/h]مِ', ar: false, options: MADDS, answer: 4,
        explain: 'You stop on the م, and the madd letter ي is right before it: Madd ʿArid, 2, 4 or 6 counts.' },
      { prompt: 'How long is Madd Lazim?', ar: false, options: ['6 counts', '2 counts', '1 count'], answer: 0,
        explain: 'Madd Lazim is always 6 counts.' },
      { prompt: 'How long do you hold the highlighted letter at the start of Surah Al-Qalam?', arabic: '[h]نٓ[/h] وَٱلْقَلَمِ', ar: false,
        options: ['6 counts', '2 counts', 'No stretch'], answer: 0,
        explain: 'نٓ is read "nūūūn" for 6 counts. It is Madd Lazim, the first red letter in Ms. Afra\'s Color Code!' },
      { prompt: 'When you stop on ٱلرَّحِيمِ, how long may you stretch it?', ar: false,
        options: ['2, 4 or 6 counts', 'Only 1 count', 'Exactly 5 counts'], answer: 0,
        explain: 'Madd ʿArid can be 2, 4 or 6 counts. Pick one and keep it the same.' },
      { type: 'listen', prompt: 'Listen carefully. Which ayah of Al-Fatiha did you hear?', audio: '001004',
        options: ['مَٰلِكِ يَوْمِ ٱلدِّينِ', 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ'], answer: 0,
        explain: 'That was ayah 4: "Māliki yawmid-dīn". It has a natural madd on مَٰلِكِ and a Madd ʿArid on ٱلدِّينِ when you stop.' },
      { type: 'record', prompt: 'Listen, then record yourself. Hold ٱلضَّآلِّينَ for 6 counts!',
        arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ [b]عَلَيْهِمْ وَلَا[/b] ٱلضَّ[r]آ[/r]لِّ[r]ي[/r]نَ', audio: '001007',
        explain: 'Fold six fingers while you hold the alif of ٱلضَّآلِّينَ, and keep the meem of عَلَيْهِمْ clear before وَلَا.' }
    ]
  };

  /* ================= LEEN ACLOPIPS ================= */
  var LML = ['Madd letter', 'Leen letter', 'Neither'];

  C.leen = {
    id: 'leen',
    title: 'Leen Aclopips',
    intro: 'Leen means soft and gentle. Here in Aclopips, nature and inventions grow together, just as gently. Read the three signs, learn the lessons, then take the exam.',
    welcome: 'Welcome to Leen Aclopips! Here, trees grow solar leaves and flowers spin in the wind to make power, and nature and inventions live together softly. Leen letters are soft too. Read the three signs, then find me at the pavilion with the turquoise roof.',
    stones: [
      { icon: '🌬️', name: 'Leen Waw', translit: 'وْ after a fatha', letters: 'وْ',
        desc: 'A waw with a sukoon after a fatha is a soft leen letter. Say "aw" gently: خَوْف, يَوْم.' },
      { icon: '🏠', name: 'Leen Yaa', translit: 'يْ after a fatha', letters: 'يْ',
        desc: 'A yaa with a sukoon after a fatha is a soft leen letter. Say "ay" gently: بَيْت, عَلَيْهِمْ.' },
      { icon: '🛑', name: 'Madd Leen', translit: 'when you stop · 2, 4 or 6', letters: 'وْ يْ',
        desc: 'When you stop on a word and the leen letter is right before the last letter, you may stretch it 2, 4 or 6 counts: قُرَيْشْ, ٱلْبَيْتْ, خَوْفْ.' }
    ],
    lessons: [
      {
        id: 'ln-intro', title: 'What are Leen Letters?',
        note: 'Leen = soft. Leen letters: وْ or يْ (with sukoon) after a FATHA: خَوْف, بَيْت, يَوْم. After a damma/kasra they are madd letters instead: يَقُولُ, قِيلَ.',
        pages: [
          { html: '<p><b>Leen</b> (لِين) means <b>soft</b> and <b>gentle</b>. The leen letters are <span class="quran big">و</span> and <span class="quran big">ي</span> when they have a <b>sukoon</b> and a <b>fatha</b> comes before them.</p>' +
              ex([['خَ[h]وْ[/h]ف', '"khawf" · fear'], ['بَ[h]يْ[/h]ت', '"bayt" · house'], ['يَ[h]وْ[/h]م', '"yawm" · day']]) +
              '<p>You met them briefly on Starter Island. Now let\'s really learn them!</p>' },
          { html: '<p>🔵 <b>Tricky!</b> Look at the harakah <b>before</b> the letter. It decides whether the letter is madd or leen:</p>' +
              ex([['يَقُ[r]و[/r]لُ', 'damma before و<br><b>madd</b> (stretch)'], ['[b]يَوْمِ[/b]', 'fatha before و<br><b>leen</b> (soft)']]) +
              ex([['قِ[r]ي[/r]لَ', 'kasra before ي<br><b>madd</b> (stretch)'], ['[b]بَيْت[/b]', 'fatha before ي<br><b>leen</b> (soft)']]) }
        ]
      },
      {
        id: 'ln-soft', title: 'Soft in the Middle',
        note: 'When you keep reading, a leen letter is NOT stretched: just glide softly, "aw" / "ay". يَوْمِ ٱلدِّينِ, عَلَيْهِمْ. Don\'t say "beet" or "ʿalaaayhim".',
        pages: [
          { ayah: '001004', html: '<p>When you keep reading, a leen letter is <b>not stretched</b> at all. Just let your voice <b>glide</b> softly: "aw" or "ay".</p>' +
              ex([['يَوْمِ ٱلدِّينِ', '"yawmid-dīn"'], ['عَلَيْهِمْ', '"ʿalayhim"']]) +
              '<p>Listen to Al-Fatiha, ayah 4: the leen in <span class="quran">يَوْمِ</span> is soft and quick.</p>' },
          { html: '<p>🔵 <b>Tricky!</b> Keep the fatha sound. Don\'t change the vowel, and don\'t stretch it:</p>' +
              ex([['[b]بَيْت[/b]', '✅ "bayt"<br>❌ "beet"'], ['[b]عَلَيْهِمْ[/b]', '✅ "ʿalayhim"<br>❌ "ʿalaaayhim"'], ['[b]خَوْف[/b]', '✅ "khawf"<br>❌ "khoof"']]) }
        ]
      },
      {
        id: 'ln-stop', title: 'Madd Leen: when you stop',
        note: 'Madd Leen: stopping on a word where a leen letter is right before the last letter = 2, 4 or 6 counts. Surah Quraysh: قُرَيْشْ, ٱلصَّيْفْ, ٱلْبَيْتْ, خَوْفْ.',
        pages: [
          { ayah: '106001', html: '<p>🛑 When you <b>stop</b> on a word and the leen letter is <b>right before the last letter</b>, you may stretch it <b>2, 4 or 6</b> counts. This is <b>Madd Leen</b>.</p>' +
              ex([['قُرَ[r]يْ[/r]شٍ', 'stop: "qurayyysh"'], ['ٱلصَّ[r]يْ[/r]فِ', 'stop: "aṣ-ṣayyyf"'], ['ٱلْبَ[r]يْ[/r]تِ', 'stop: "al-bayyyt"'], ['خَ[r]وْ[/r]فٍۭ', 'stop: "khawwwf"']]) +
              '<p><b>Surah Quraysh</b> is the leen surah: all four ayahs end with one! Listen to ayah 1.</p>' },
          { ayah: '106002', html: '<p>📜 <b>The story of Surah Quraysh.</b> The tribe of Quraysh lived in Makkah, by the Kaʿbah. Every <b>winter</b> their camel caravans travelled to Yemen, and every <b>summer</b> to Shām, to trade.</p>' +
              '<p style="text-align:center"><span class="quran big">إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَ[r]آ[/r]ءِ وَٱلصَّ[r]يْ[/r]فِ</span></p>' +
              '<p>"Their journeys of winter and summer." Allah reminds them to worship the Lord of the House, who <b>fed them</b> when they were hungry and kept them <b>safe from fear</b>.</p>' +
              '<p>🔴 Notice the red <span class="quran c-red">آ</span> in ٱلشِّتَآءِ too. That is a Madd Muttasil, from Madd Desert!</p>' }
        ]
      }
    ],

    challenge: [
      { prompt: 'Which word has a leen letter?', options: ['بَيْت', 'قِيلَ', 'يَقُولُ'], answer: 0,
        explain: 'In بَيْت the ي has a sukoon with a fatha before it, so it is a leen letter.' },
      { prompt: 'What makes و or ي a leen letter?', ar: false,
        options: ['A sukoon, with a fatha before it', 'A sukoon, with a damma or kasra before it', 'A shaddah on it'], answer: 0,
        explain: 'Leen letters are وْ and يْ with a fatha before them.' },
      { prompt: 'What does "leen" mean?', ar: false, options: ['Soft and gentle', 'A bounce', 'Hidden'], answer: 0,
        explain: 'Leen means soft and gentle.' },
      { prompt: 'When you keep reading (not stopping), how long is a leen letter?', ar: false,
        options: ['Not stretched, just said softly', '2 counts', '6 counts'], answer: 0,
        explain: 'In the middle of reading, a leen letter is not stretched. Just glide softly.' },
      { prompt: 'Is the highlighted letter a madd letter or a leen letter?', arabic: 'يَقُ[h]و[/h]لُ', ar: false, options: LML, answer: 0,
        explain: 'There is a damma before the و, so it is a madd letter.' },
      { prompt: 'Is the highlighted letter a madd letter or a leen letter?', arabic: 'يَ[h]وْ[/h]مِ ٱلدِّينِ', ar: false, options: LML, answer: 1,
        explain: 'There is a fatha before the وْ, so it is a leen letter.' },
      { prompt: 'Is the highlighted letter a madd letter or a leen letter?', arabic: 'عَلَ[h]يْ[/h]هِمْ', ar: false, options: LML, answer: 1,
        explain: 'There is a fatha before the يْ, so it is a leen letter. Don\'t stretch it!' },
      { prompt: 'Is the highlighted letter a madd letter or a leen letter?', arabic: 'قِ[h]ي[/h]لَ', ar: false, options: LML, answer: 0,
        explain: 'There is a kasra before the ي, so it is a madd letter.' },
      { prompt: 'You stop at the end of this ayah. How long may you stretch the leen letter?', arabic: 'لِإِيلَٰفِ [h]قُرَيْشٍ[/h]', ar: false,
        options: ['2, 4 or 6 counts', 'Only 1 count', 'No stretch at all'], answer: 0,
        explain: 'When you stop, it becomes Madd Leen: 2, 4 or 6 counts.' },
      { type: 'listen', prompt: 'Listen carefully. Which ayah of Surah Quraysh did you hear?', audio: '106003',
        options: ['فَلْيَعْبُدُوا۟ رَبَّ هَٰذَا ٱلْبَيْتِ', 'لِإِيلَٰفِ قُرَيْشٍ', 'إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ'], answer: 0,
        explain: 'That was ayah 3: "Falyaʿbudū rabba hādhal-bayt". It ends with a Madd Leen on ٱلْبَيْتِ.' },
      { type: 'record', prompt: 'Listen, then record yourself. Stretch the leen in خَوْفٍۭ when you stop!',
        arabic: 'ٱلَّذِ[r]ىٓ[/r] أَطْعَمَهُم مِّن جُوعٍ وَءَامَنَهُم مِّنْ خَ[r]وْ[/r]فٍۭ', audio: '106004',
        explain: 'Stretch ٱلَّذِىٓ 4 or 5 counts (Munfasil), and when you stop, stretch خَوْفْ 2, 4 or 6 counts (Madd Leen).' }
    ]
  };

  /* Islands that have lessons, by id */
  C.ISLANDS = { starter: C.starter, makharij: C.makharij, noon: C.noon, meem: C.meem, qalqalah: C.qalqalah, madd: C.madd, leen: C.leen };

  C.findLesson = function (id) {
    var found = null;
    Object.keys(C.ISLANDS).forEach(function (k) {
      var l = C.ISLANDS[k].lessons.find(function (x) { return x.id === id; });
      if (l) found = l;
    });
    return found;
  };

  /* ================= FERRY RIDE LINES =================
     'at' = how far along the trip (0..1). fx: bell / moo / dolphins */
  C.ferryLines = function (from, to) {
    if (from === 'harbor' && to === 'starter') {
      return [
        { at: 0.02, who: 'captain', text: 'Bismillah! Hold on tight, off we go!', fx: 'bell', dur: 5 },
        { at: 0.09, who: 'afra', text: 'When we travel, we say: "Subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā lamunqalibūn."', dur: 9 },
        { at: 0.19, who: 'afra', text: 'It means: "Glory be to the One who made this ride easy for us. We could never have done it ourselves, and to our Lord we will surely return."', dur: 8 },
        { at: 0.28, who: 'captain', text: 'My cow loves the sea breeze. Don\'t you, girl?', fx: 'moo', dur: 5 },
        { at: 0.36, who: 'captain', text: 'Look to the left, dolphins! SubḥānAllāh!', fx: 'dolphins', dur: 6 },
        { at: 0.48, who: 'afra', text: 'Did you know? The Quran was first sent down in the blessed month of Ramadan.', dur: 7 },
        { at: 0.59, who: 'afra', text: 'The Prophet ﷺ said: "The best of you are those who learn the Quran and teach it."', dur: 7 },
        { at: 0.70, who: 'afra', text: 'On Starter Island we will learn the Arabic letters and their marks, the building blocks of every ayah.', dur: 7 },
        { at: 0.82, who: 'captain', text: 'Nearly there… Land ahoy! Starter Island!', fx: 'bell', dur: 5 },
        { at: 0.92, who: 'afra', text: 'Come and find me at the learning pavilion when we land.', dur: 5 }
      ];
    }
    if (to === 'madd') {
      return [
        { at: 0.02, who: 'captain', text: 'Bismillah! Set sail for Madd Desert! I hope you brought water.', fx: 'bell', dur: 5 },
        { at: 0.09, who: 'afra', text: 'Let\'s say the travel dua: "Subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā lamunqalibūn."', dur: 9 },
        { at: 0.22, who: 'afra', text: 'Madd means stretching. Remember the red in my Color Code? Red means stretch, so this island will be full of red!', dur: 8 },
        { at: 0.34, who: 'captain', text: 'Dolphins! Look how long that one stretched its jump. A 6-count dolphin!', fx: 'dolphins', dur: 6 },
        { at: 0.46, who: 'afra', text: 'Someone once asked Anas how the Prophet ﷺ recited. He said his recitation had madd: he stretched بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ.', dur: 9 },
        { at: 0.60, who: 'afra', text: 'So when we stretch the right letters for the right counts, we are following the Sunnah.', dur: 7 },
        { at: 0.72, who: 'captain', text: 'Moooooooo! That was a Madd Lazim moo. Six counts, girl!', fx: 'moo', dur: 5 },
        { at: 0.84, who: 'captain', text: 'Land ahoy! Madd Desert! Mind the hot sand.', fx: 'bell', dur: 5 },
        { at: 0.92, who: 'afra', text: 'Read the five stones, then come and find me at the pavilion.', dur: 5 }
      ];
    }
    if (to === 'leen') {
      return [
        { at: 0.02, who: 'captain', text: 'Bismillah! Set sail for Leen Aclopips!', fx: 'bell', dur: 5 },
        { at: 0.09, who: 'afra', text: 'Let\'s say the travel dua: "Subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā lamunqalibūn."', dur: 9 },
        { at: 0.21, who: 'captain', text: 'Aclopips is a strange place. The trees have solar panels for leaves, and the flowers spin like windmills!', dur: 7 },
        { at: 0.32, who: 'afra', text: 'Nature and inventions living together gently. And leen means gentle: soft letters, said without pushing.', dur: 7 },
        { at: 0.43, who: 'captain', text: 'Dolphins! They glide so softly. Leen dolphins!', fx: 'dolphins', dur: 6 },
        { at: 0.54, who: 'afra', text: 'Surah Quraysh is the leen surah. The Quraysh were travellers too: caravans to Yemen in winter, and to Shām in summer.', dur: 8 },
        { at: 0.66, who: 'afra', text: 'Allah fed them when they were hungry and kept them safe from fear. Just like He keeps us safe on this ferry. Alḥamdulillāh.', dur: 8 },
        { at: 0.78, who: 'captain', text: 'Mmm-oo. That was a soft leen moo. Very gentle.', fx: 'moo', dur: 5 },
        { at: 0.86, who: 'captain', text: 'Land ahoy! Leen Aclopips! Look at those windmill flowers spin!', fx: 'bell', dur: 5 },
        { at: 0.93, who: 'afra', text: 'Read the three signs, then come and find me at the pavilion.', dur: 5 }
      ];
    }
    if (to === 'qalqalah') {
      return [
        { at: 0.02, who: 'captain', text: 'Bismillah! Set sail for Qalqalah Cliffs!', fx: 'bell', dur: 5 },
        { at: 0.09, who: 'afra', text: 'Let\'s say the travel dua: "Subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā lamunqalibūn."', dur: 9 },
        { at: 0.22, who: 'afra', text: 'Qalqalah means an echo or a bounce. Five letters bounce when they have a sukoon: ق ط ب ج د.', dur: 7 },
        { at: 0.33, who: 'captain', text: 'Dolphins! Look how they bounce out of the water. Qalqalah dolphins!', fx: 'dolphins', dur: 6 },
        { at: 0.45, who: 'afra', text: 'Here is a story. The Prophet ﷺ used to go to the cave of Ḥirāʾ to worship Allah. One night the angel Jibreel came to him.', dur: 9 },
        { at: 0.58, who: 'afra', text: 'The first word Jibreel brought was ٱقْرَأْ, "Read!". And the ق in it has a qalqalah!', dur: 8 },
        { at: 0.71, who: 'captain', text: 'My cow tried to bounce once. The whole boat shook! Moo!', fx: 'moo', dur: 5 },
        { at: 0.84, who: 'captain', text: 'Land ahoy! Qalqalah Cliffs! Listen to the waves echo.', fx: 'bell', dur: 5 },
        { at: 0.92, who: 'afra', text: 'Read the five stones, then come and find me at the pavilion.', dur: 5 }
      ];
    }
    if (to === 'meem') {
      return [
        { at: 0.02, who: 'captain', text: 'Bismillah! Set sail for Meem Saakin Island!', fx: 'bell', dur: 5 },
        { at: 0.09, who: 'afra', text: 'Let\'s say the travel dua: "Subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā lamunqalibūn."', dur: 9 },
        { at: 0.22, who: 'afra', text: 'Meem saakin is a meem with a sukoon, like in أَلَمْ. It comes from the lips.', dur: 7 },
        { at: 0.33, who: 'captain', text: 'Dolphins again! MashaAllah, they follow us to every island.', fx: 'dolphins', dur: 6 },
        { at: 0.45, who: 'afra', text: 'Many of our examples come from Surah Al-Fil, about the army of the elephant that came to attack the Kaʿbah.', dur: 8 },
        { at: 0.57, who: 'afra', text: 'Allah sent flocks of birds carrying stones of baked clay, and the army was defeated. SubḥānAllāh.', dur: 8 },
        { at: 0.70, who: 'captain', text: 'My cow\'s favourite letter is meem. Mmmmoo!', fx: 'moo', dur: 5 },
        { at: 0.84, who: 'captain', text: 'Land ahoy! Meem Saakin Island!', fx: 'bell', dur: 5 },
        { at: 0.92, who: 'afra', text: 'Read the three signs, then come and find me at the pavilion.', dur: 5 }
      ];
    }
    if (to === 'noon') {
      return [
        { at: 0.02, who: 'captain', text: 'Bismillah! Full steam ahead to Noon Saakin Island!', fx: 'bell', dur: 5 },
        { at: 0.09, who: 'afra', text: 'Let\'s say the travel dua: "Subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā lamunqalibūn."', dur: 9 },
        { at: 0.22, who: 'afra', text: 'Noon saakin is a noon with a sukoon, like in مِنْ. And tanween sounds just like one!', dur: 7 },
        { at: 0.34, who: 'captain', text: 'Dolphins! They are jumping clearly. That\'s Izhar dolphins, Ms. Afra!', fx: 'dolphins', dur: 6 },
        { at: 0.46, who: 'afra', text: 'Ha! Very good, Captain. There are four rules: Izhar (clear), Idgham (merge), Iqlab (change) and Ikhfa (hide).', dur: 8 },
        { at: 0.60, who: 'afra', text: 'Which rule we use depends on the letter that comes right after the noon.', dur: 7 },
        { at: 0.72, who: 'captain', text: 'Mmm-moo! My cow hums like a ghunnah. Mmmm!', fx: 'moo', dur: 5 },
        { at: 0.84, who: 'captain', text: 'Land ahoy! Noon Saakin Island!', fx: 'bell', dur: 5 },
        { at: 0.92, who: 'afra', text: 'Read the four signs, then come and find me at the pavilion.', dur: 5 }
      ];
    }
    if (to === 'makharij') {
      return [
        { at: 0.02, who: 'captain', text: 'Bismillah! Next stop: Makharij Isle!', fx: 'bell', dur: 5 },
        { at: 0.10, who: 'afra', text: 'Let\'s say the travel dua together: "Subḥānalladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā lamunqalibūn."', dur: 9 },
        { at: 0.24, who: 'afra', text: 'A makhraj is the place a letter\'s sound comes from, like the letter\'s home. Makharij means "homes".', dur: 7 },
        { at: 0.36, who: 'captain', text: 'Dolphins on the left! SubḥānAllāh, they never get tired of saying hello.', fx: 'dolphins', dur: 6 },
        { at: 0.49, who: 'afra', text: 'When a letter leaves its home, its sound changes, and sometimes the meaning of the word changes too!', dur: 7 },
        { at: 0.62, who: 'afra', text: 'قلب with a ق means "heart", but كلب with a ك means "dog". So makharij really matter!', dur: 8 },
        { at: 0.74, who: 'captain', text: 'Moo! Even my cow knows her makharij. Mmmooo comes from the lips!', fx: 'moo', dur: 6 },
        { at: 0.84, who: 'captain', text: 'Land ahoy! Makharij Isle, with its five standing stones!', fx: 'bell', dur: 5 },
        { at: 0.92, who: 'afra', text: 'Visit the stones, then come and find me at the pavilion.', dur: 5 }
      ];
    }
    return [
      { at: 0.02, who: 'captain', text: 'Bismillah! Off we go!', fx: 'bell', dur: 5 },
      { at: 0.15, who: 'afra', text: 'Remember the travel dua: "Subḥānalladhī sakhkhara lanā hādhā…"', dur: 6 },
      { at: 0.32, who: 'captain', text: 'Dolphins again! I think they like you.', fx: 'dolphins', dur: 6 },
      { at: 0.50, who: 'afra', text: 'You can read your notes any time. Just tap the 📓 button.', dur: 6 },
      { at: 0.66, who: 'captain', text: 'Moo! That\'s my cow saying hello.', fx: 'moo', dur: 5 },
      { at: 0.84, who: 'captain', text: 'Dock ahead! Thank you for sailing with Captain Baqara.', fx: 'bell', dur: 6 }
    ];
  };
})();
