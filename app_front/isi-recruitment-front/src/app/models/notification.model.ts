export interface AppNotification {
  id: string;
  type: string;
  data: {
    titre: string;
    message: string;
    url: string;
  };
  read_at: string | null;
  created_at: string;
}
