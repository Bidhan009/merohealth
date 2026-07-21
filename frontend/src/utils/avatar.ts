const AVATAR_COLORS = [
  { bg: "bg-[#006a63]", text: "text-white" },
  { bg: "bg-[#001535]", text: "text-white" },
  { bg: "bg-[#8bf1e6]", text: "text-primary" },
  { bg: "bg-[#d7e2ff]", text: "text-primary" },
  { bg: "bg-[#006f67]", text: "text-white" },
  { bg: "bg-[#0f2a52]", text: "text-white" },
];

export function getAvatarColor(name: string): { bg: string; text: string } {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}