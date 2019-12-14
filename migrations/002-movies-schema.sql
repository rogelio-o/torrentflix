-- Up
CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  external_reference_id TEXT,
  title TEXT,
  genres TEXT,
  popularity NUMERIC DECIMAL(4, 2),
  vote_average NUMERIC DECIMAL(4, 2),
  vote_count INTEGER,
  original_language TEXT,
  description TEXT,
  poster TEXT,
  backdrop TEXT,
  release_date DATE,
  duration INTEGER
);
-- Down
DROP TABLE movies;
