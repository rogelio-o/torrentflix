export const formatEpisodeNumber = (number) => {
  return number < 10 ? "0" + number : number;
};

export const formatEpisodeCode = (season, episode) => {
  return (
    "S" +
    formatEpisodeNumber(season.number) +
    "E" +
    formatEpisodeNumber(episode.number)
  );
};

export const formatTorrentSearchQuery = (serie, season, episode) => {
  return encodeURI(serie.name + " " + formatEpisodeCode(season, episode));
};
