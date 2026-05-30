// ===== authcenterapi =====
export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  username: string;
  email: string;
  status: string;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

// Envelope standar authcenterapi
export interface ApiEnvelope<T> {
  status: boolean;
  message?: string;
  data?: T;
  error?: { code?: string; message?: string };
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

// ===== core-manager-api =====
export interface WaAccount {
  account_id: string;
  user_id: string;
  account_name: string;
  account_alias?: string | null;
  phone_number?: string | null;
  sender_jid?: string | null;
  connect_status: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateAccountPayload {
  user_id: string;
  account_name: string;
  account_alias?: string;
  phone_number?: string;
}

// Kontak milik user (core-manager-api, tabel public.contacts)
export interface CoreContact {
  contact_id: string;
  account_id: string;
  user_id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateCoreContactPayload {
  account_id: string;
  user_id: string;
  name: string;
  phone_number: string;
  email?: string;
  notes?: string;
}

// ===== whatsapp-api =====
export type MessageType =
  | "text"
  | "image"
  | "video"
  | "document"
  | "audio"
  | "location";

export interface SendMessagePayload {
  account_id: string;
  to: string;
  type: MessageType;
  text?: string;
}

export interface SendMessageResponse {
  message: { id: string };
}

export interface Contact {
  name: string;
  phone: string;
  short?: string;
}

export interface ContactsResponse {
  account_id: string;
  account_name: string;
  account_alias: string;
  connect_status: string;
  contacts: Contact[] | null;
}

export interface Group {
  name: string;
  phone: string;
  short?: string;
}

export interface GroupsResponse {
  account_id: string;
  account_name: string;
  account_alias: string;
  groups: Group[] | null;
}

// whatsapp-api error: { error: { code, message } }
export interface WhatsAppError {
  error: { code: string; message: string };
}

// ===== core-manager-api: Tags =====
export interface Tag {
  tag_id: string;
  user_id: string;
  name: string;
  color?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateTagPayload {
  user_id: string;
  name: string;
  color?: string;
}

export interface UpdateTagPayload {
  name?: string;
  color?: string;
}

// ===== core-manager-api: Segments =====
export type SegmentRuleField = "name" | "phone_number" | "email" | "tag";
export type SegmentRuleOperator = "eq" | "contains" | "has";

export interface SegmentRule {
  field: SegmentRuleField;
  operator: SegmentRuleOperator;
  value: string;
}

export interface SegmentConditions {
  match: "all" | "any";
  rules: SegmentRule[];
}

export interface Segment {
  segment_id: string;
  user_id: string;
  name: string;
  description?: string | null;
  conditions: SegmentConditions;
  member_count: number;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateSegmentPayload {
  user_id: string;
  name: string;
  description?: string;
  conditions: SegmentConditions;
}

export interface UpdateSegmentPayload {
  name?: string;
  description?: string;
  conditions?: SegmentConditions;
}

// ===== qrstreamer (WebSocket) =====
export type WSMessageType =
  | "ws_state"
  | "qr_code"
  | "event_state"
  | "error";

export interface WSMessage {
  msg_status: boolean;
  type: WSMessageType;
  whatsapp_id: string;
  data: string;
  timestamp: string;
}
