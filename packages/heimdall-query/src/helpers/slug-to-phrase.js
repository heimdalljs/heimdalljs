module.exports = function slugToPhrase(slug) {
  let words = slug.split('-');

  for (let i = 0; i < words.length; i++) {
    let s = words[i];

    words[i] = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return words.join(' ');
};
