function getMarbleByRarity (raritys, rarity_id) {
  const matchedRarity = raritys.find(rarity => {
    return rarity.id === rarity_id;
  });
  return matchedRarity.id;
}

module.exports = {
  getMarbleByRarity: getMarbleByRarity
};