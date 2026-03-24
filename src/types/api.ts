export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export type UserProfileSummary = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  theme_preference: string | null;
  notifications_enabled: boolean;
};
