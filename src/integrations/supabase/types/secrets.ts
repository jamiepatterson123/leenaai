export type SecretRow = {
  created_at: string;
  id: string;
  name: string;
  value: string;
};

export type SecretInsert = {
  created_at?: string;
  id?: string;
  name: string;
  value: string;
};

export type SecretUpdate = {
  created_at?: string;
  id?: string;
  name?: string;
  value?: string;
};