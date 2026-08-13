import type { ScriptTemplate, Genre } from '@/types';

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 'shonen-battle',
    label: 'Shonen Battle',
    icon: '🔥',
    accent: '#f97316',
    script: `SCENE 1 — CLASH OF SOULS
[Setting: A ruined colosseum under a blood-red sky, debris floating in the air.]
KENJI: You think you've won? I haven't even shown you my true power yet.
RYUIN: Your power is nothing against the Void. Surrender, or be erased.
KENJI: I made a promise — to everyone who believed in me!

SCENE 2 — AWAKENING
[Setting: Energy erupts from Kenji's body, golden light splitting the clouds.]
NARRATOR: In that moment, the seal within Kenji's soul shattered. A power dormant for a thousand years surged through every fiber of his being.
KENJI: This is the strength of those who came before me!

SCENE 3 — FINAL STRIKE
[Setting: The two warriors charge, their energies colliding in a blinding flash that tears through the sky.]
RYUIN: Impossible...!
KENJI: RYUIN — THIS ENDS NOW!`,
  },
  {
    id: 'cyberpunk-city',
    label: 'Cyberpunk City',
    icon: '🌆',
    accent: '#06b6d4',
    script: `SCENE 1 — INFILTRATION
[Setting: Neon-soaked rain falls over Neo-Tokyo, holographic billboards flickering on every surface.]
NOVA: Target building is 40 floors up. Security is tight — but not tight enough.
ECHO: I've got your back. Jamming their cameras in three... two... one.
NOVA: In and out. Nobody gets hurt.

SCENE 2 — THE VAULT
[Setting: A server room bathed in cold blue light, data streams glowing in the air.]
NARRATOR: The corporate vault held secrets that could topple an empire. Nova had risked everything to reach this moment.
NOVA: Found it. The kill code. This ends their control tonight.
ECHO: Guards incoming — you've got ninety seconds!

SCENE 3 — ESCAPE
[Setting: Nova bursts through a window, gliding across the neon skyline with drones in pursuit.]
NOVA: Echo, I need an exit — now!
ECHO: Rooftop extraction in sixty seconds. Don't miss it.`,
  },
  {
    id: 'fantasy-world',
    label: 'Fantasy World',
    icon: '🔮',
    accent: '#a78bfa',
    script: `SCENE 1 — THE ANCIENT RUIN
[Setting: Sunlight pierces through cracked stone walls of a forgotten temple, moss-covered pillars reaching toward the sky.]
LYRA: These ruins... they predate the kingdoms. What were the Old Ones hiding here?
SAGE: Something that should have stayed buried. Be careful what you touch.

SCENE 2 — AWAKENING
[Setting: A crystalline orb pulses with light, illuminating ancient murals that begin to move.]
NARRATOR: As Lyra's fingers brushed the crystal, the murals came alive — telling a story of creation, destruction, and the fragile balance that held their world together.
LYRA: I can see it... the source of all magic. It was never lost — it was waiting.

SCENE 3 — THE CHOICE
[Setting: The temple transforms around Lyra, golden light flooding every corridor.]
SAGE: The power chooses its vessel wisely. Will you bear this burden?
LYRA: I will. For everyone who can't.`,
  },
  {
    id: 'custom',
    label: 'Custom Script',
    icon: '✨',
    accent: '#6366F1',
    script: `Write your story here...

SCENE 1 — TITLE
[Setting: Describe the setting and atmosphere.]
CHARACTER NAME: Write dialogue here.
NARRATOR: Write narration here.`,
  },
];

export function getTemplate(id: Genre): ScriptTemplate {
  return SCRIPT_TEMPLATES.find((t) => t.id === id) ?? SCRIPT_TEMPLATES[0];
}
