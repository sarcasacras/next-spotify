# 🎵 Next Spotify

A modern, Apple Music-inspired Spotify client built with Next.js that reimagines how you interact with your music library. Experience your liked tracks through beautiful album artwork with seamless playback and intelligent queue management.

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Features

### 🎨 **Visual-First Music Discovery**
- **Unique Album Grid**: Display your liked tracks organized by album artwork
- **Smooth Modal Animations**: Click any album to expand with fluid Framer Motion animations
- **Apple Music-Inspired Design**: Clean, modern interface with careful attention to visual hierarchy

### 🎵 **Intelligent Playback**
- **Smart Queue Management**: Automatically continues with shuffled library tracks after album playback
- **Context-Aware Play Button**: Adapts behavior - shuffle library when idle, play/pause when active
- **Seamless Track Transitions**: Queue exhaustion triggers automatic library reshuffling for endless playback

### 🔍 **Powerful Search**
- **Dual Search Modes**: Search within your liked tracks OR across all of Spotify
- **Real-time Results**: Instant search with TanStack Query caching
- **Quick Actions**: Like/unlike tracks directly from search results

### 🎛️ **Advanced Player Controls**
- **Web Playback SDK Integration**: Full Spotify player functionality
- **Real-time Progress**: Live position tracking with smooth UI updates
- **Volume Control**: Integrated volume slider with visual feedback
- **Queue Awareness**: Intelligent next/previous button states

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Authentication**: NextAuth.js with Spotify OAuth
- **Data Fetching**: TanStack Query with optimistic updates
- **Music Playback**: Spotify Web Playback SDK

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Spotify Premium Account (required for Web Playback SDK)
- Spotify App credentials

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/next-spotify.git
cd next-spotify/my-app
npm install
```

### 2. Spotify App Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Note your Client ID and Client Secret

### 3. Environment Configuration
Create `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with Spotify!

## 🎯 Key Technical Highlights

### **Intelligent Queue Management**
```typescript
// Seamless library continuation when album queues end
if (state.track_window.next_tracks.length === 0) {
  setTimeout(() => {
    shuffleLibrary(prev.device_id, prev.allLikedTracks);
  }, 100);
}
```

### **Smart Album + Library Queuing**
```typescript
// Creates album context + shuffled library continuation
const finalTrackUris = [
  ...albumUris,
  ...shuffledLibrary.map(t => t.uri)
];
await playTracks(finalTrackUris, trackIndex);
```

### **Context-Aware Play Button**
```typescript
const handlePlayButtonClick = async () => {
  if (current_track) {
    togglePlayPause(); // Normal play/pause
  } else {
    await shuffleLibrary(); // Start fresh shuffle
  }
};
```

## 🔧 Architecture Decisions

### **State Management**
- **React Context**: Centralized Spotify player state management
- **TanStack Query**: Server state with intelligent caching and background updates
- **Optimistic Updates**: Immediate UI feedback for like/unlike actions

### **Performance Optimizations**
- **Image Optimization**: Next.js Image component with Spotify CDN patterns
- **Debounced Search**: Prevents excessive API calls during typing
- **Background Refetching**: Keeps library data fresh without user intervention

### **User Experience**
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Responsive Design**: Mobile-first approach with careful touch targets
- **Error Handling**: Graceful degradation with user-friendly error messages

## 📱 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Update Spotify app redirect URI to your domain

The app is optimized for Vercel deployment with automatic builds and preview deployments.

## 🤝 Contributing

This is a portfolio project, but I'm open to discussions about improvements or interesting feature ideas! Feel free to open issues for bugs or suggestions.

## 🙏 Acknowledgments

- **Spotify** for their excellent Web API and Web Playback SDK
- **Apple Music** for design inspiration
- **Vercel** for seamless deployment experience

---

**Built with ❤️ by Andrei Davidovich** | [LinkedIn](https://www.linkedin.com/in/andrei-davidovich/)
