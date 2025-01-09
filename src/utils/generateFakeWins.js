// Semplice generatore di vincite fittizie
function generateFakeWins() {
    // Generiamo un nome e un importo random
    const names = ['Mario', 'Lucia', 'Giuseppe', 'Giulia', 'Francesca', 'Davide'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAmount = 100; // può essere sempre 100€ o random
  
    return {
      name: randomName,
      amount: randomAmount,
      timestamp: new Date().toLocaleTimeString()
    };
  }
  
  module.exports = generateFakeWins;
