export function formatDate(dateStr: string | number): string {
  const date = new Date(typeof dateStr === 'number' ? dateStr : dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Format the date part
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;

  // Within last 24 hours: "Apr 9, 2:30 PM (2h ago)"
  if (diffDays < 1) {
    const relative = diffMins < 1 ? 'Just now'
      : diffMins < 60 ? `${diffMins}m ago`
      : `${diffHours}h ago`;
    return `${month} ${day}, ${hour12}:${minutes} ${ampm} (${relative})`;
  }

  // Within last 7 days: "Apr 7, 2:30 PM (2d ago)"
  if (diffDays < 7) {
    return `${month} ${day}, ${hour12}:${minutes} ${ampm} (${diffDays}d ago)`;
  }

  // Same year: "Apr 5, 2:30 PM"
  if (date.getFullYear() === now.getFullYear()) {
    return `${month} ${day}, ${hour12}:${minutes} ${ampm}`;
  }

  // Different year: "Apr 5, 2025"
  return `${month} ${day}, ${date.getFullYear()}`;
}
