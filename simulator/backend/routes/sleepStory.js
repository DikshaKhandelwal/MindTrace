/**
 * sleepStory.js
 * POST /api/sleep/story  →  generates a personalised bedtime story
 * Uses OpenAI gpt-4o-mini when OPENAI_API_KEY is present, demo stories otherwise.
 */

import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// ── Demo stories (one per place) ─────────────────────────────────────────────
const DEMO = {
  beach: `You are lying on warm sand at the edge of the water, and the last light of evening is turning the sea into copper and rose.
Far out on the water, a small fishing boat rocks gently — a single amber lantern swaying at its bow, crossing slowly toward the horizon. [pause]
You watch it with soft eyes. Someone out there is also very quiet tonight. The boat grows smaller, and smaller, and then it is just a warm point of light in the dark.
The waves come in without hurry. Each one lifts something from your chest as it retreats — a small, steady unburdening. [pause]
A lighthouse blinks far in the distance. One slow pulse of white. Then dark. Then white again.
You count them the way you used to count streetlights as a child, drifting in the back of a car — without meaning to, without effort. [pause]
The salt is cool on your lips. The sand holds the warmth of the afternoon in it still, radiating up through your back, through your shoulders, through everything that has been holding tension all day.
The sand is letting you borrow its warmth for the night. [pause]
The lighthouse blinks on. One. And now you are already somewhere softer.
The tide is coming in. Your breath is going out.
The lantern on the boat has disappeared into the dark, and that is alright.
Sleep is coming in with the tide.`,

  mountains: `The meadow above the treeline is cold and silent and lit by more stars than you have ever seen at once.
You are lying in the grass and you have just watched a meteor burn a white line across the whole sky — there and gone, a scratch of light on glass. [pause]
At the meadow's edge, a red fox pauses midstep and looks at you. Its eyes catch the starlight for a moment.
Then it turns slowly and disappears between the pines, as if it has simply decided you are safe to leave here. [pause]
A high mountain lake nearby holds the whole sky in its surface — the Milky Way upside down, perfectly still, perfect.
You breathe in. Cold, clean air with the smell of pine resin and old stone. You breathe out slowly. [pause]
The earth beneath you is solid and ancient. These peaks have held ten thousand nights exactly like this one.
Storms passed. And after storms, stillness like this. Always. [pause]
Your thoughts have become the shapes of clouds — arriving, changing, releasing, gone.
The cold sharpens everything and you feel very awake and then, strangely, very close to sleep. [pause]
The fox has vanished. The meteor is already gone. The stars turn slowly, unhurried.
Your eyes are growing heavy in the cold, wonderful air.
The mountain is still. You are still. Sleep is here.`,

  space: `You are drifting through space, and Saturn is passing below you — enormous and unhurried, its rings stretching out like rings of smoke frozen in time.
You move through the outer edge of them slowly. Tiny ice fragments drift past like snow that has forgotten how to fall. [pause]
The silence here is not empty. It has a texture — soft and deep and impossibly old. You feel it in your chest like a held breath finally released.
Every muscle that has been braced against something lets go. [pause]
Far ahead, a pulsar blinks with a slow and perfect rhythm. One pulse every three seconds.
You breathe with it. In. Pulse. Out. Dark. In. Pulse again. [pause]
Below you, a nebula stretches out in violet and amber — a cloud of gas and newborn light, a hundred light-years wide and utterly, stunningly calm.
From here, it looks like something you have dreamed before. [pause]
Time is different this far out. The clocks of the ordinary day have no meaning here.
What matters, what is real, is only this: your breath, and the slow blinking of the distant star, and dark. [pause]
Your eyes grow heavy with starlight.
The rings of Saturn turn beneath you, patient as a sleeping planet.
You are already going further in. Sleep is as wide as space out here.`,

  forest: `You have found a clearing very deep in the forest, and when you lie back on the moss you notice something strange and beautiful — all around the roots of an old oak, small mushrooms are glowing.
A soft blue-green faint light, pulsing gently, as if breathing. [pause]
You reach out and rest your hand near one. It does not stop glowing. The forest already knows you belong here.
Overhead, the canopy sways. The old trees creak their slow language to each other and fall quiet. [pause]
Somewhere above you, an owl passes without a sound — you see only the dark shape of its wings crossing the pale gap in the branches, gone before you are sure of what you saw.
The stream nearby moves over stones, patient and low, the oldest and most trustworthy sound. [pause]
The moss beneath you is impossibly soft. Generations of this forest have grown and fallen and become this softness.
You are resting on time itself. [pause]
The mushrooms glow on. The stream speaks its continuous, half-understood word. The trees breathe above you.
Everything here is old and quiet and deeply, deeply safe. [pause]
Your thoughts release the way leaves release in autumn — without effort, without loss, just the natural letting go.
The forest dims. The glow remains.
Sleep comes in the way dawn comes into a forest: gently, without announcing itself, already here.`,

  rain: `You are warm inside and rain is falling on the window — a steady, intimate sound, water writing something on the glass.
On the sill beside you, a cup of chamomile tea is still sending up a slow thread of steam. You wrap your hands around it. The warmth moves up your arms. [pause]
You watch a single raindrop at the top of the glass. It hesitates, gathers itself, then runs slowly, slowly down, gathering others as it goes.
You lose it at the bottom and find a new one and lose that one too, and it doesn't matter at all. [pause]
Outside, under the streetlamp, the pavement shines. A cat sits perfectly still in a doorway, watching the rain with more patience than you thought was possible.
You and the cat are both watching the same rain. [pause]
The sound fills the room like a second blanket. Below the rain, below everything, there is a deep quiet — this room, this warmth, this cup in your hands.
You have been held before, on other rainy nights. You are being held now. [pause]
The tea has cooled to exactly the right temperature. You drink the last of it.
The rain speaks its endless lullaby against the glass, unhurried and full of kindness. [pause]
The cat outside has gone. The rain remains. The warmth in your chest from the tea is still there.
Your eyes are closing. The rain will go on all night.
It will still be there when you wake, or it will have stopped, and either way you will have slept well.`,

  clouds: `You are lying in a slow cloud, drifting above everything, and it is just before evening.
Below you the world is a patchwork — green fields, a river bending silver through a valley, the tiny amber squares of lit windows as towns prepare for night. [pause]
You pass over a small city and see it whole from up here — the streets a grid of light, a park dark and round at its centre like a held breath.
Everyone down there is settling in. And up here, you are drifting quietly above all of it. [pause]
Another cloud passes alongside you, vast and unhurried, its underside painted pink by the setting sun.
You have all the time in the world. There is nowhere for a cloud to be late to. [pause]
At the edge of the sky, a rainbow is finishing — the last arc of colour softening into blue. You are the only one who can see it from up here.
You watch it fade without sadness. It was there. It was beautiful. That is enough. [pause]
The sky is darkening now, the first stars appearing above you while below the streetlights blink on one by one.
Your own thoughts have taken the shape of clouds — soft-edged, slow, dissolving before they fully form. [pause]
The cloud holds you completely. You are between the last light and the first dark, between everything and nothing.
Your breath is slow and even and perfectly your own.
The world below is going to sleep. You are going with it.`,
};

// ── Route ─────────────────────────────────────────────────────────────────────
router.post('/story', async (req, res) => {
  const { mood = 'calm', place = 'forest' } = req.body ?? {};
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const story = DEMO[place] ?? DEMO.forest;
    return res.json({ story, demo: true });
  }

  const openai = new OpenAI({ apiKey });

  const prompt = `Write a personalised bedtime sleep story for someone who is feeling "${mood}" tonight.
Setting: ${place}.

Rules:
- Exactly 200-240 words
- Second person ("you are…")
- Tone: slow, drowsy, hypnotic — no tension or conflict
- Include [pause] markers after every 2-3 sentences (at natural breathing points)
- Describe sensory detail: temperature, sound, breath, weight
- Final sentence ends with the reader falling asleep
- Do NOT use the phrase "close your eyes" more than once
- Output only the story text — no title, no intro`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 420,
      temperature: 0.82,
    });
    const story = completion.choices[0]?.message?.content?.trim() ?? DEMO[place] ?? DEMO.forest;
    res.json({ story, demo: false });
  } catch (err) {
    console.error('[SleepStory]', err.message);
    res.json({ story: DEMO[place] ?? DEMO.forest, demo: true, error: err.message });
  }
});

export { router as sleepStoryRouter };
