-- Up
ALTER TABLE movies
ADD
  watched INTEGER NOT NULL DEFAULT 0;
ALTER TABLE series_episodes
ADD
  watched INTEGER NOT NULL DEFAULT 0;
-- Down
ALTER TABLE movies DROP COLUMN watched;
ALTER TABLE series_episodes DROP COLUMN watched;
