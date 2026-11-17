# Moodify – Mood-Based Music Player

A music player that picks songs for how you feel. Type or speak your mood and Moodify builds a matching playlist, with an audio visualizer, GSAP animations and mood-coloured particle effects.

**Live demo:** https://sanjeet-saini.github.io/moodify/

## Features

- **Mood engine** – type (or say) how you feel; keyword scoring maps it to chill, sad, romantic, gym, happy or bhakti, and the playlist is re-ranked to match
- **Learns from you** – moods you pick often get a small boost next time (stored in `localStorage`)
- **Voice input** using the Web Speech API (where the browser supports it)
- **Mood collections** – category cards for Lofi, Happy, Sad, Emotional, Gym, Bhakti and Romantic
- **Search** by song name, vibe, category or mood
- **Favourites**, remembered **volume** and listening stats
- **Full player controls** – play/pause, next/previous, seek bar, auto-play next song
- **Keyboard shortcuts** – Space (play/pause), ← / → (previous/next), ignored while typing
- **Swipe gestures** on the player to change songs
- **Live audio visualizer** with the Web Audio API and **canvas particle effects**
- **GSAP** entrance and transition animations

## Tech stack

- JavaScript (ES6+)
- **GSAP** for animations
- HTML5 Canvas, Web Audio API (`AnalyserNode`) and Web Speech API
- Web Storage API (`localStorage`)
- HTML5 and CSS3, Font Awesome icons

## How it works

1. `detectMoodFromText()` scores the typed text against keyword lists for each mood, adds a small bonus for moods you listen to often and for the time of day, and picks the highest score.
2. `getRecommendedSongs()` sorts the library so songs tagged with that mood come first, then songs from the matching category.
3. When a song plays, the audio element is connected to a Web Audio `AnalyserNode`, and its frequency data drives the canvas visualizer.

## Run locally

No build step is needed. Serve the folder with any static server (needed for audio and the visualizer):

```bash
git clone https://github.com/sanjeet-saini/moodify.git
cd moodify
npx http-server .
```

> **Note:** the songs in `media/` are included only for demo purposes and belong to their respective owners.

## Author

**Sanjeet Saini** · [GitHub](https://github.com/sanjeet-saini) · [LinkedIn](https://www.linkedin.com/in/sanjeet-saini-880b1827a)
