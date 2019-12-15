-- Up
CREATE TABLE series (
  id INTEGER PRIMARY KEY,
  external_reference_id TEXT,
  name TEXT,
  poster TEXT,
  backdrop TEXT,
  status TEXT,
  network TEXT,
  genres TEXT,
  description TEXT,
  vote_average NUMERIC DECIMAL(4, 2),
  vote_count INTEGER
);
-- Down
DROP TABLE series;
