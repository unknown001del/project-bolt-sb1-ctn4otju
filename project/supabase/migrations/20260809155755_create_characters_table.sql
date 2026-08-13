/*
# Add characters table for AI-generated cast

1. New Tables
- `characters`: cast members for a movie project. Each character has a name,
  role (protagonist, antagonist, supporting, etc.), a generated backstory,
  personality traits, visual appearance description, a voice profile
  (pitch, rate, voice type) used by the TTS narration engine, and an
  accent color for their avatar.

2. Relationships
- characters.project_id -> projects.id (CASCADE)

3. Security
- RLS enabled. Same single-tenant pattern as all other tables:
  anon + authenticated full CRUD (intentionally public, no sign-in).

4. Notes
- The voice_pitch (0.5-2.0) and voice_rate (0.5-2.0) fields control
  the Web Speech API utterance parameters for text-to-speech narration.
- voice_type is a semantic label (e.g. 'deep-male', 'soft-female')
  used to pick an appropriate system voice when available.
*/

CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'New Character',
  role text NOT NULL DEFAULT 'supporting',
  description text NOT NULL DEFAULT '',
  personality text NOT NULL DEFAULT '',
  appearance text NOT NULL DEFAULT '',
  voice_type text NOT NULL DEFAULT 'neutral',
  voice_pitch real NOT NULL DEFAULT 1.0,
  voice_rate real NOT NULL DEFAULT 1.0,
  accent_color text NOT NULL DEFAULT '#e8a317',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_characters" ON characters;
CREATE POLICY "anon_select_characters" ON characters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_characters" ON characters;
CREATE POLICY "anon_insert_characters" ON characters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_characters" ON characters;
CREATE POLICY "anon_update_characters" ON characters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_characters" ON characters;
CREATE POLICY "anon_delete_characters" ON characters FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS characters_project_id_idx ON characters(project_id);
