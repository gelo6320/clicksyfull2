// backend/src/utils/fakeWins.js
const names = ['Mario', 'Lucia', 'Giuseppe', 'Giulia', 'Francesca', 'Davide', 'Sara', 'Roberto'];
const fakeWins = [];

function generateFakeWin() {
  const name = names[Math.floor(Math.random() * names.length)];
  const amount = 100;
  const time = new Date().toLocaleTimeString();
  return { name, amount, time };
}

// Initialize with some fake wins
for (let i = 0; i < 4; i++) { // Inizializza con 4 vincite
  fakeWins.push(generateFakeWin());
}

// Generate fake wins every 10 seconds
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