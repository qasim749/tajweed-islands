/* Tajweed Islands – saving
   The game saves when you press 💾, every 30 seconds, and automatically
   when you close or leave the tab. Saves live in this browser only. */
TI.Save = {
  KEY: 'tajweedIslands.save.v1',
  data: null,

  defaults: function () {
    return {
      version: 1,
      lang: 'en',
      character: null,      // 'girl' | 'boy'
      skin: 0xc68642,
      pet: null,            // 'cat' | 'parrot' | 'chick' | 'dove'
      location: 'harbor',
      tickets: [],          // islands you may sail to
      completed: [],        // islands whose challenge is finished
      lessonsDone: [],
      notebook: [],         // lesson ids saved in your private notebook
      visited: ['harbor'],
      introDone: false,
      passedTest: false,
      gameMinutes: 7 * 60,  // in-game clock (starts 7:00 am)
      settings: { sound: true, script: 'uthmani', reciter: 'Husary_128kbps' }
    };
  },

  exists: function () {
    try { return !!localStorage.getItem(this.KEY); } catch (e) { return false; }
  },

  load: function () {
    var d = this.defaults();
    try {
      var raw = localStorage.getItem(this.KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        var settings = Object.assign({}, d.settings, saved.settings || {});
        this.data = Object.assign(d, saved, { settings: settings });
        return true;
      }
    } catch (e) { /* corrupted or blocked storage – start fresh */ }
    this.data = d;
    return false;
  },

  save: function () {
    if (!this.data) return false;
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.data));
      return true;
    } catch (e) { return false; }
  },

  reset: function () { this.data = this.defaults(); },

  erase: function () {
    try { localStorage.removeItem(this.KEY); } catch (e) { /* ignore */ }
  }
};
