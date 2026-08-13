/*
# Anime Movie Studio — core schema (single-tenant, no auth)

This app is a creative production studio for building an animated/anime movie.
It is single-tenant with no sign-in screen, so all policies are open to
anon + authenticated (the data is intentionally shared/public).

1. New Tables
- `projects`: a movie production. Has a title, genre, target runtime in minutes
  (e.g. 120 for 2hrs, 180 for 3hrs), a status, and a poster accent color.
- `scenes`: an ordered scene within a project. Each scene has a title, an order
  index, a duration in seconds, narration/dialogue text, and a visual "setting"
  used by the renderer (sunset, night-city, forest, mountain, storm, ocean).
- `frames`: storyboard frames within a scene (the visual edit layer). Each frame
  has a caption, a shot type (wide, medium, close-up, aerial), a color palette
  key, a mood, and an order index.
- `tracks`: sound layers for a scene (the sound edit layer). Each track has a
  name, a type (music, sfx, voice, ambience), a mood/tone key used by the audio
  engine, a volume 0..1, and an order index.

2. Relationships
- scenes.project_id -> projects.id (CASCADE)
- frames.scene_id -> scenes.id (CASCADE)
- tracks.scene_id -> scenes.id (CASCADE)

3. Security
- RLS enabled on every table.
- All tables allow anon + authenticated full CRUD (intentionally public,
  single-tenant app with no sign-in).

4. Notes
- Durations are stored in seconds; the player sums scene durations to estimate
  runtime against the project's target_runtime_minutes.
- All tables use gen_random_uuid() defaults so inserts can omit the id.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  genre text NOT NULL DEFAULT 'Action',
  logline text,
  target_runtime_minutes integer NOT NULL DEFAULT 120,
  status text NOT NULL DEFAULT 'draft',
  poster_accent text NOT NULL DEFAULT '#e8a317',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Scene',
  order_index integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 60,
  narration text NOT NULL DEFAULT '',
  setting text NOT NULL DEFAULT 'sunset',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  caption text NOT NULL DEFAULT '',
  shot_type text NOT NULL DEFAULT 'wide',
  palette text NOT NULL default 'amber',
  mood text NOT NULL DEFAULT 'calm'
);

ALTER TABLE frames ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  name text NOT NULL DEFAULT 'New Layer',
  type text NOT NULL DEFAULT 'ambience',
  tone text NOT NULL DEFAULT 'calm',
  volume real NOT NULL DEFAULT 0.5
);

ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- projects policies
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

-- scenes policies
DROP POLICY IF EXISTS "anon_select_scenes" ON scenes;
CREATE POLICY "anon_select_scenes" ON scenes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scenes" ON scenes;
CREATE POLICY "anon_insert_scenes" ON scenes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scenes" ON scenes;
CREATE POLICY "anon_update_scenes" ON scenes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scenes" ON scenes;
CREATE POLICY "anon_delete_scenes" ON scenes FOR DELETE
  TO anon, authenticated USING (true);

-- frames policies
DROP POLICY IF EXISTS "anon_select_frames" ON frames;
CREATE POLICY "anon_select_frames" ON frames FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_frames" ON frames;
CREATE POLICY "anon_insert_frames" ON frames FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_frames" ON frames;
CREATE POLICY "anon_update_frames" ON frames FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_frames" ON frames;
CREATE POLICY "anon_delete_frames" ON frames FOR DELETE
  TO anon, authenticated USING (true);

-- tracks policies
DROP POLICY IF EXISTS "anon_select_tracks" ON tracks;
CREATE POLICY "anon_select_tracks" ON tracks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tracks" ON tracks;
CREATE POLICY "anon_insert_tracks" ON tracks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tracks" ON tracks;
CREATE POLICY "anon_update_tracks" ON tracks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tracks" ON tracks;
CREATE POLICY "anon_delete_tracks" ON tracks FOR DELETE
  TO anon, authenticated USING (true);

-- helpful indexes
CREATE INDEX IF NOT EXISTS scenes_project_id_idx ON scenes(project_id);
CREATE INDEX IF NOT EXISTS frames_scene_id_idx ON frames(scene_id);
CREATE INDEX IF NOT EXISTS tracks_scene_id_idx ON tracks(scene_id);

-- bump updated_at on project change
CREATE OR REPLACE FUNCTION touch_project_updated_at()
RETURNS trigger AS $$
BEGIN
  UPDATE projects SET updated_at = now() WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scenes_touch_project ON scenes;
CREATE TRIGGER scenes_touch_project
  AFTER INSERT OR UPDATE OR DELETE ON scenes
  FOR EACH ROW EXECUTE FUNCTION touch_project_updated_at();
