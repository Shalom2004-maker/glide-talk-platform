# Aura Chat

Project name
LetsChat

Purpose
Build a modern web chat platform. Focus on fast messaging, clean UI, and responsive design for mobile, tablet, and desktop.

Design style
Minimal. Soft glassmorphism with subtle shadows. Smooth transitions. Clean typography.

Color system
Support two themes.

Light theme
• Background: soft white or light gray
• Chat bubbles: light blue for sender, light gray for receiver
• Text: dark gray or black
• Accent color: modern blue

Dark theme
• Background: deep charcoal or near-black.
• Chat bubbles: dark blue for sender, dark gray for receiver
• Text: white or light gray
• Accent color: soft neon blue

Theme behavior
• Provide a theme toggle in the top navigation bar
• Icon changes between sun and moon
• The theme switches instantly without a page reload
• Save the user preference in local storage
• Detect system theme on first visit

Main layout

Navigation bar
• App logo “LetChat.”
• Search icon
• Theme toggle
• User profile avatar

Left sidebar
• List of conversations
• User avatars
• Last message preview
• Unread message badge
• Search bar for contacts

Main chat area
• Chat header with contact name and status
• Scrollable message area
• Message bubbles with timestamps
• Typing indicator
• Emoji picker
• Message input field with send button

Right sidebar
• Contact profile details
• Media shared in the chat
• Mute and block options

Key features
• Real-time messaging interface
• Online and offline status
• Typing indicator
• Message reactions
• Image and file sharing
• Emoji support
• Message read receipts
• Responsive layout

Animations
• Smooth bubble entrance animation
• Hover effects on chat list items
• Smooth theme transition between light and dark

Typography
• Clean modern font
• Clear message spacing
• Large readable text on mobile

Mobile behavior
• Sidebar collapses into a slide menu
• Chat occupies full screen
• Floating new message button

Accessibility
• High-contrast text
• Keyboard navigation support
• Clear focus states

Extra UI details
• Rounded chat bubbles
• Soft shadows
• Glass effect for panels
• Smooth scrolling in chat window

Output requirement
Generate a modern, responsive UI for LetChat with complete light and dark theme support.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
