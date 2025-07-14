// Release notes data structure for easy maintenance
// To add a new version, simply add an object to the top of this array

export interface ReleaseNote {
  version: string;
  date: string;
  changes: string[];
  loomVideoId: string; // Just the video ID from the Loom URL
}

export const releaseNotes: ReleaseNote[] = [
  {
    version: "2.1.0",
    date: "March 15, 2024",
    changes: [
      "New dark mode support for better night viewing",
      "Improved performance with 40% faster loading times",
      "Added offline mode for core features",
      "Enhanced accessibility with VoiceOver improvements",
      "Bug fixes for iOS 17 compatibility"
    ],
    loomVideoId: "b3d3eac20f6e4e0b83e3d4b780acbbf9"
  },
  {
    version: "2.0.5",
    date: "February 28, 2024",
    changes: [
      "Fixed crash when rotating device during onboarding",
      "Improved search functionality with instant results",
      "Added haptic feedback for better user experience",
      "Updated privacy settings with granular controls"
    ],
    loomVideoId: "your-loom-video-id-here"
  },
  {
    version: "2.0.0",
    date: "February 1, 2024",
    changes: [
      "Complete redesign with modern iOS interface",
      "Introduced premium subscription features",
      "Added collaborative sharing capabilities",
      "New widget for iOS home screen",
      "Enhanced security with biometric authentication",
      "Performance optimizations across the entire app"
    ],
    loomVideoId: "your-loom-video-id-here"
  },
  {
    version: "1.9.8",
    date: "January 10, 2024",
    changes: [
      "Holiday theme and animations",
      "Fixed memory leak in background processing",
      "Improved sync reliability",
      "Added export functionality for user data"
    ],
    loomVideoId: "your-loom-video-id-here"
  }
];