-- Up
CREATE TABLE series_episodes (
  id INTEGER PRIMARY KEY,
  serie_id INTEGER,
  season INTEGER,
  number INTEGER,
  name TEXT,
  date DATE,
  description TEXT,
  vote_average NUMERIC DECIMAL(4, 2),
  vote_count INTEGER,
  poster TEXT,
  FOREIGN KEY(serie_id) REFERENCES series(id) ON UPDATE CASCADE ON DELETE CASCADE
);
-- Down
DROP TABLE series_episodes;
