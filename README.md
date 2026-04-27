# The Vinyl Vault

The Vinyl Vault is a web app that lets users track the albums they've listened to, rate their favorites, and build a personal music collection. Users can save albums locally, write reviews, and see a history of their listening activity. The app also includes suggested albums by genre, creating an organized and user-friendly experience for music lovers. This project also includes an AI-powered feature that generates a “music personality” based on a selected album.

## Working Features

- Add albums manually or from suggested recommendations
- Rate albums using a 5-star system
- Write and save personal reviews
- Mark albums as favorites
- View listening history
- Filter albums by artist or genre
- Browse suggested albums using an API
- Data persists using localStorage
- AI-generated “Music Personality” analysis for each album (Groq LLM integration)

## Tech Stack

- React (frontend framework)
- JavaScript (ES6)
- CSS for styling
- localStorage for data persistence
- Git & GitHub for version control
- Netlify for deployment
- Groq LLM API (AI personality generation)

## AI Feature

This feature uses a Large Language Model (LLM) using the Groq API. When a user selects an album, they can click “What does this album say about me?” to generate an AI-powered analysis of the album’s vibe and what it suggests about the listener’s personality.
