// backend/src/utils/fakeWins.js
const names = ['Mario', 'Lucia', 'Giuseppe', 'Giulia', 'Francesca', 'Davide', 'Sara', 'Roberto'];
const fakeWins = [];

function generateFakeWin() {
  const name = names[Math.floor(Math.random() * names.length)];
  const amount = 100;
  const time = new Date().toLocaleTimeString();
  return { name, amount, time };
}

// Inizializza con 4 vincite
for (let i = 0; i < 4; i++) { // Inizializza con 4 vincite
  fakeWins.push(generateFakeWin());
}

// Genera nuove vincite ogni 10 secondi
setInterval(() => {
  const newWin = generateFakeWin();
  fakeWins.unshift(newWin);
  if (fakeWins.length > 4) { // Mantiene solo 4 vincite
    fakeWins.pop();
  }
  console.log('Generated new fake win:', newWin);
}, 10000);

function getFakeWins() {
  return fakeWins;
}

module.exports = { getFakeWins };