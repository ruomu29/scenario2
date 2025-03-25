import { FieldValue, Timestamp } from "firebase/firestore";

// Helper function to format Firebase timestamp as relative time
const formatRelativeTime = (timestamp : any) => {
    if (!timestamp) return '';
    
    // Firebase timestamp is either a Firestore Timestamp object or a date in milliseconds
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    
    // For older messages, use the date
    return date.toLocaleDateString();
  };
  
  // Use in your renderItem function
export {formatRelativeTime}