export interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  reaction?: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  messages: Message[];
  unread: number;
  typing: boolean;
}

const ME = "me";

export const contacts: Contact[] = [
  { id: "1", name: "Sarah Chen", avatar: "SC", status: "online" },
  { id: "2", name: "Alex Rivera", avatar: "AR", status: "online" },
  { id: "3", name: "Maya Johnson", avatar: "MJ", status: "offline", lastSeen: "2h ago" },
  { id: "4", name: "James Wilson", avatar: "JW", status: "online" },
  { id: "5", name: "Priya Patel", avatar: "PP", status: "offline", lastSeen: "30m ago" },
  { id: "6", name: "Leo Martinez", avatar: "LM", status: "online" },
  { id: "7", name: "Emma Davis", avatar: "ED", status: "offline", lastSeen: "1h ago" },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    contact: contacts[0],
    unread: 2,
    typing: false,
    messages: [
      { id: "m1", senderId: "1", text: "Hey! Have you seen the new design system?", timestamp: "10:30 AM", read: true },
      { id: "m2", senderId: ME, text: "Yes! It looks amazing 🔥", timestamp: "10:32 AM", read: true },
      { id: "m3", senderId: "1", text: "Right? The glassmorphism effect is so clean", timestamp: "10:33 AM", read: true },
      { id: "m4", senderId: ME, text: "Totally. Let me share some mockups I've been working on", timestamp: "10:35 AM", read: true },
      { id: "m5", senderId: "1", text: "Can't wait to see them!", timestamp: "10:36 AM", read: false },
      { id: "m6", senderId: "1", text: "Also, are you free for a call later today?", timestamp: "10:37 AM", read: false },
    ],
  },
  {
    id: "c2",
    contact: contacts[1],
    unread: 0,
    typing: true,
    messages: [
      { id: "m7", senderId: ME, text: "How's the project going?", timestamp: "9:15 AM", read: true },
      { id: "m8", senderId: "2", text: "Making good progress! Almost done with the API", timestamp: "9:20 AM", read: true },
      { id: "m9", senderId: ME, text: "Great, let's sync up tomorrow", timestamp: "9:22 AM", read: true },
    ],
  },
  {
    id: "c3",
    contact: contacts[2],
    unread: 1,
    typing: false,
    messages: [
      { id: "m10", senderId: "3", text: "The meeting notes are ready", timestamp: "Yesterday", read: true },
      { id: "m11", senderId: ME, text: "Thanks Maya, I'll review them tonight", timestamp: "Yesterday", read: true },
      { id: "m12", senderId: "3", text: "Sure! Let me know if you have questions 😊", timestamp: "Yesterday", read: false },
    ],
  },
  {
    id: "c4",
    contact: contacts[3],
    unread: 0,
    typing: false,
    messages: [
      { id: "m13", senderId: "4", text: "Game night this Friday?", timestamp: "Monday", read: true },
      { id: "m14", senderId: ME, text: "Count me in! 🎮", timestamp: "Monday", read: true },
    ],
  },
  {
    id: "c5",
    contact: contacts[4],
    unread: 3,
    typing: false,
    messages: [
      { id: "m15", senderId: "5", text: "I sent over the documents", timestamp: "11:00 AM", read: false },
      { id: "m16", senderId: "5", text: "Please check when you can", timestamp: "11:01 AM", read: false },
      { id: "m17", senderId: "5", text: "It's urgent 🙏", timestamp: "11:05 AM", read: false },
    ],
  },
  {
    id: "c6",
    contact: contacts[5],
    unread: 0,
    typing: false,
    messages: [
      { id: "m18", senderId: ME, text: "Happy birthday! 🎂🎉", timestamp: "Yesterday", read: true },
      { id: "m19", senderId: "6", text: "Thank you so much!! 🥳", timestamp: "Yesterday", read: true },
    ],
  },
  {
    id: "c7",
    contact: contacts[6],
    unread: 0,
    typing: false,
    messages: [
      { id: "m20", senderId: "7", text: "See you at the conference next week!", timestamp: "Sunday", read: true },
      { id: "m21", senderId: ME, text: "Definitely! Looking forward to it", timestamp: "Sunday", read: true },
    ],
  },
];
