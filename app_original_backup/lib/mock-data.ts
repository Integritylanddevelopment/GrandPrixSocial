// Mock data for development - this file provides sample data structure
// In production, all data comes from the API endpoints

export const mockPosts = [
  {
    id: "1",
    content:
      "Just watched the highlights from Monza! That overtake in turn 1 was absolutely insane 🏎️ Who else thinks this season is shaping up to be one of the best? #F1 #MonzaGP",
    author: "Max Verstappen Fan",
    team: "Red Bull Racing Team",
    timestamp: "2h ago",
    likes: 24,
    comments: 8,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ],
  },
  {
    id: "2",
    content:
      "Team meetup at F1 Cafe this Saturday! We're planning to watch the race together and discuss strategy. Still have 3 spots available - DM me if you want to join! ☕🏁",
    author: "Lewis Hamilton Squad",
    team: "Mercedes AMG Team",
    timestamp: "4h ago",
    likes: 42,
    comments: 15,
    images: [],
  },
  {
    id: "3",
    content:
      "Check out my latest addition to the collection! Signed helmet from the 2019 Monaco GP. The detail work is incredible - you can even see the carbon fiber weave pattern! 🏎️✨",
    author: "F1 Collector Hub",
    team: "Independent Team",
    timestamp: "1d ago",
    likes: 89,
    comments: 23,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    ],
  },
]

export const mockTeams = [
  {
    id: "1",
    name: "Ferrari Fanatics",
    members: 127,
    points: 8942,
    color: "#DC143C",
  },
  {
    id: "2",
    name: "Mercedes Squad",
    members: 98,
    points: 7856,
    color: "#00D2BE",
  },
  {
    id: "3",
    name: "Red Bull Racing",
    members: 156,
    points: 7234,
    color: "#0600EF",
  },
]

export const mockChallenges = [
  {
    id: "1",
    title: "Monaco GP Prediction",
    description: "Predict top 3 finishers and earn bonus points",
    reward: 500,
    timeLeft: "2d left",
    type: "prediction",
  },
  {
    id: "2",
    title: "Team Building Sprint",
    description: "Recruit 5 new members to your team",
    reward: 1000,
    timeLeft: "5d left",
    type: "recruitment",
  },
]
