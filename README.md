# 🏝️ Tajweed Islands — Stage 1

A 3D browser game with realistic lighting, water and sky, where you sail between islands on Captain Baqara's free cow ferry and learn tajweed with Ms. Afra.

## How to play

**Easiest:** double-click `index.html` to open it in Chrome or Edge. You need an internet connection, because the 3D engine, fonts and Quran recitation load online.

**For the microphone (record & compare):** some browsers only allow the microphone from a web server. In this folder, run:

```
python -m http.server 8000
```

Then open http://localhost:8000.

### Controls
| | Computer | Phone / tablet |
|---|---|---|
| Walk | WASD or arrow keys (Shift to run) | Joystick (bottom left) |
| Look around | Drag with the mouse, scroll to zoom | Drag on the screen |
| Talk / interact | E, Space or Enter | ✋ button |

## What's in Stage 1
- Language menu (11 languages), then choosing a girl or boy, skin tone, and pet (cat, parrot, chick, dove)
- **The Harbor:** cozy dock, ticket booth, lanterns, Captain Baqara, his cow, and the cow ferry
- **Harbor Test:** get 4 of 5 right to skip Starter Island
- **Long ferry ride cutscene:** travel dua, dolphins, seagulls, a sailboat, and chatting with Ms. Afra and the captain
- **Starter Island:** 5 lessons (letters, harakat, sukoon & shaddah, leen letters, Ms. Afra's Color Code) and an 11-question challenge
- **Mistakes:** the challenge carries on, then you get a second try at your mistakes at the end (see Stage 5 for the exam rules)
- Day/night cycle (1 real second = 1 game minute), weather (clear, cloudy, rain, windy, fog), and turquoise shallows
- Prayer-time notices, private notebook, Save button, and autosave (on close, on tab switch, and every 30 seconds)
- No music: only nature sounds, animal sounds and recitation

## Stage 2: Makharij Isle
- A new island with a purple-roofed pavilion and **five standing stones**: the Open Space (al-Jawf), Throat (al-Ḥalq), Tongue (al-Lisān), Lips (ash-Shafatān) and Nose (al-Khayshūm). Walk up to a stone and press E to read it.
- 4 lessons: What is a Makhraj? (with a tappable mouth diagram), The Throat Letters, The Tongue Letters, and Lips, Nose & the Open Space
- A 12-question challenge (tap, listen, record), with review at the end, that earns the ticket to Noon Saakin Island
- The captain can now sail you to **any island you have a ticket for**. Passing the Harbor Test lets you sail straight to Makharij Isle.
- Special ferry dialogue on the way to Makharij (قلب "heart" vs كلب "dog")
- Ferry routes now automatically curve away from other islands

## Stage 3: Noon Saakin Island
- A new island with an orange-roofed pavilion and **four signs**: Izhar, Idgham, Iqlab and Ikhfa
- 5 lessons: Noon Saakin & Tanween, Izhar (clear), Idgham (merge, with and without ghunnah, plus the four one-word exceptions), Iqlab (change), Ikhfa (hide)
- A 12-question challenge: spot the rule in highlighted words, listen (Az-Zalzalah 7), and record (Al-Humazah 1)
- Finishing it earns the ticket to Meem Saakin Island (coming soon)
- Ferry dialogue on the way, including the captain's "Izhar dolphins"

## Stage 4: Meem Saakin Island
- A new island with a pink-roofed pavilion and **three signs**: Ikhfa Shafawi, Idgham Shafawi and Izhar Shafawi
- 4 lessons, with examples from Surah Al-Fil, Surah Quraysh and Al-Fatiha (including keeping the meem clear in عَلَيْهِمْ وَلَا)
- An 11-question challenge (spot the rule, listen to Al-Fil 1, record Al-Fil 4) that earns the ticket to Qalqalah Cliffs (coming soon)
- The HUD now shows only your next destination

## Stage 5: Qalqalah Cliffs
- A rocky island with tall grey cliffs, a blue-roofed pavilion (قُطْبُ جَدٍّ) and **five letter stones**: ق ط ب ج د
- 4 lessons: What is Qalqalah?, Minor Qalqalah (Sughra), Major Qalqalah (Kubra, including the strongest bounce on a shaddah), and Careful Bounces (no extra vowel, and no bounce if you don't stop)
- A 12-question exam (spot the qalqalah, listen to Al-Ikhlas 3, record Al-Falaq 1) that earns the ticket to Madd Desert (coming soon)
- Ferry story on the way: the first revealed word, ٱقْرَأْ, has a qalqalah

### Challenges are now real exams
- When you get a question right, Ms. Afra explains why, so you learn
- A wrong answer is not revealed. The exam carries on, and every mistake gets **one** more try at the end, with no hints
- If you get it wrong again, Ms. Afra shows the right answer and explains it
- You need **80%** to earn the ferry ticket. Otherwise Ms. Afra sends you back to your lessons to retake the exam. Scores are private.

## Stage 6: Madd Desert & Leen Aclopips
- **Madd Desert:** sand dunes, cacti, an oasis, a red-roofed pavilion and five stones (Natural, Muttasil, Munfasil, Lazim, ʿArid). 5 lessons covering counts, the dagger alif, the madda sign, نٓ / الٓمٓ (Madd Lazim) and stopping. 12-question exam.
- **Leen Aclopips** (a new island): nature merged with inventions. It has trees with metal trunks and solar-panel leaves, wind-turbine flowers that spin faster in windy weather, glass garden domes, and night-glowing bulbs. 3 signs (Leen Waw, Leen Yaa, Madd Leen), 3 lessons built around Surah Quraysh (with its story), and an 11-question exam that earns the ticket to Heavy & Light Volcano (coming soon).
- Every island's lessons now use Ms. Afra's Color Code (red = hold/stretch, blue = tricky). The key is shown on every lesson menu and in the notebook.

To add a new island later: add its lessons and challenge to `js/content.js` (and to `C.ISLANDS`), and mark it `built: true` in `C.MAP`.

## Adding the azan
Put an azan recording at `assets/audio/azan.mp3`. It plays automatically at each prayer time in the game.

## Files
- `js/content.js`: all lessons, questions and ferry dialogue (the easiest file to edit)
- `js/i18n.js`: menu translations
- `js/models.js`: characters, pets, the cow ferry and scenery, plus the textures (all generated in code, no image files)
- `js/world.js`: sea, island terrain, grass, sky, lighting, weather
- `js/ui.js`: menus, dialogue, lessons, challenges
- `js/main.js`: game flow, ferry cutscene and saving

## Notes
- Recitation audio comes from everyayah.com (Al-Husary by default, Alafasy in Settings).
- Lesson text is English for now. Menus are translated, but the translations should be checked by native speakers.
- Islamic content should be reviewed by a qualified teacher before public release.
