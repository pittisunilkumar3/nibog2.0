// Certificate Template Types
export interface CertificateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'image' | 'signature';
  required: boolean;

  // Position and Layout
  x: number; // Position percentage
  y: number; // Position percentage
  width?: number;
  height?: number;
  max_width?: number; // Maximum width percentage

  // Typography
  font_size?: number;
  font_family?: string;
  font_weight?: 'normal' | 'bold' | 'bolder' | 'lighter';
  font_style?: 'normal' | 'italic' | 'oblique';
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  line_height?: number;

  // Text Styling
  underline?: boolean; // For text fields, adds underline styling
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  text_decoration?: 'none' | 'underline' | 'line-through' | 'overline';
  letter_spacing?: number; // In pixels

  // Text Effects
  text_shadow?: {
    enabled: boolean;
    color?: string;
    offset_x?: number;
    offset_y?: number;
    blur_radius?: number;
  };

  // Background and Border
  background_color?: string;
  background_enabled?: boolean;
  border_enabled?: boolean;
  border_color?: string;
  border_width?: number;
  border_style?: 'solid' | 'dashed' | 'dotted';
  border_radius?: number;

  // Padding
  padding_top?: number;
  padding_bottom?: number;
  padding_left?: number;
  padding_right?: number;

  // Field-specific properties
  signature_type?: 'text' | 'image'; // For signature fields

  // Image specific (for image fields)
  image_opacity?: number; // 0-1
  image_filter?: 'none' | 'grayscale' | 'sepia' | 'blur';
}

// Background style options
export interface BackgroundStyle {
  type: 'image' | 'solid' | 'gradient';
  image_url?: string; // For image type
  solid_color?: string; // For solid type
  gradient_colors?: string[]; // For gradient type
  border_enabled?: boolean;
  border_color?: string;
  border_width?: number;
  border_style?: 'solid' | 'dashed' | 'dotted';
}

// Certificate title styling
export interface CertificateTitleStyle {
  // Position and Layout
  x: number; // Position percentage
  y: number; // Position percentage
  max_width?: number; // Maximum width percentage

  // Typography
  font_size?: number;
  font_family?: string;
  font_weight?: 'normal' | 'bold' | 'bolder' | 'lighter';
  font_style?: 'normal' | 'italic' | 'oblique';
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  line_height?: number;

  // Text Styling
  underline?: boolean;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  text_decoration?: 'none' | 'underline' | 'line-through' | 'overline';
  letter_spacing?: number; // In pixels

  // Text Effects
  text_shadow?: {
    enabled: boolean;
    color?: string;
    offset_x?: number;
    offset_y?: number;
    blur_radius?: number;
  };

  // Background and Border
  background_color?: string;
  background_enabled?: boolean;
  border_enabled?: boolean;
  border_color?: string;
  border_width?: number;
  border_style?: 'solid' | 'dashed' | 'dotted';
  border_radius?: number;

  // Padding
  padding_top?: number;
  padding_bottom?: number;
  padding_left?: number;
  padding_right?: number;
}

// Signature styling
export interface SignatureStyle {
  // Position and Layout
  x: number; // Position percentage
  y: number; // Position percentage
  max_width?: number; // Maximum width percentage

  // Typography (for text signatures)
  font_size?: number;
  font_family?: string;
  font_weight?: 'normal' | 'bold' | 'bolder' | 'lighter';
  font_style?: 'normal' | 'italic' | 'oblique';
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  line_height?: number;

  // Text Styling
  underline?: boolean;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  text_decoration?: 'none' | 'underline' | 'line-through' | 'overline';
  letter_spacing?: number; // In pixels

  // Text Effects
  text_shadow?: {
    enabled: boolean;
    color?: string;
    offset_x?: number;
    offset_y?: number;
    blur_radius?: number;
  };

  // Background and Border
  background_color?: string;
  background_enabled?: boolean;
  border_enabled?: boolean;
  border_color?: string;
  border_width?: number;
  border_style?: 'solid' | 'dashed' | 'dotted';
  border_radius?: number;

  // Padding
  padding_top?: number;
  padding_bottom?: number;
  padding_left?: number;
  padding_right?: number;

  // Image specific (for image signatures)
  image_width?: number;
  image_height?: number;
  image_opacity?: number; // 0-1
  image_filter?: 'none' | 'grayscale' | 'sepia' | 'blur';
}

// Appreciation text positioning
export interface AppreciationTextStyle {
  text: string;
  x: number; // Position percentage
  y: number; // Position percentage
  max_width?: number; // Maximum width percentage

  // Typography
  font_size?: number;
  font_family?: string;
  font_weight?: 'normal' | 'bold' | 'bolder' | 'lighter';
  font_style?: 'normal' | 'italic' | 'oblique';
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  line_height?: number;

  // Text Styling
  underline?: boolean;
  text_transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  text_decoration?: 'none' | 'underline' | 'line-through' | 'overline';
  letter_spacing?: number; // In pixels

  // Text Effects
  text_shadow?: {
    enabled: boolean;
    color?: string;
    offset_x?: number;
    offset_y?: number;
    blur_radius?: number;
  };

  // Background and Border
  background_color?: string;
  background_enabled?: boolean;
  border_enabled?: boolean;
  border_color?: string;
  border_width?: number;
  border_style?: 'solid' | 'dashed' | 'dotted';
  border_radius?: number;

  // Padding
  padding_top?: number;
  padding_bottom?: number;
  padding_left?: number;
  padding_right?: number;
}

export interface CertificateTemplate {
  id: number;
  name: string;
  description: string;
  type: 'participation' | 'winner' | 'event_specific';
  certificate_title?: string; // Certificate title that appears on the certificate
  certificate_title_style?: CertificateTitleStyle; // Certificate title styling and positioning
  appreciation_text?: string; // Custom appreciation text with variable support (legacy)
  appreciation_text_style?: AppreciationTextStyle; // New structured appreciation text with positioning
  signature_image?: string; // E-signature image URL
  signature_style?: SignatureStyle; // Signature styling and positioning
  background_image?: string; // File path URL (legacy)
  background_style?: BackgroundStyle; // New structured background options
  paper_size: 'a4' | 'letter' | 'a3';
  orientation: 'landscape' | 'portrait';
  fields: CertificateField[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCertificateTemplateRequest {
  name: string;
  description: string;
  type: 'participation' | 'winner' | 'event_specific';
  certificate_title?: string; // Certificate title that appears on the certificate
  certificate_title_style?: CertificateTitleStyle; // Certificate title styling and positioning
  appreciation_text?: string; // Custom appreciation text with variable support (legacy)
  appreciation_text_style?: AppreciationTextStyle; // New structured appreciation text with positioning
  signature_image?: string; // E-signature image URL
  signature_style?: SignatureStyle; // Signature styling and positioning
  background_image?: string; // Legacy background image
  background_style?: BackgroundStyle; // New structured background options
  paper_size: 'a4' | 'letter' | 'a3';
  orientation: 'landscape' | 'portrait';
  fields: CertificateField[];
}

export interface UpdateCertificateTemplateRequest extends CreateCertificateTemplateRequest {
  id: number;
  is_active?: boolean;
}

// Certificate Generation Types
export interface CertificateData {
  participant_name: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  city_name: string;
  certificate_number: string;
  [key: string]: any; // For additional dynamic fields
}

export interface GeneratedCertificate {
  id: number;
  template_id: number;
  event_id: number;
  game_id?: number;
  user_id: number;
  child_id?: number;
  certificate_data: CertificateData;
  pdf_url?: string;
  status: 'generated' | 'sent' | 'downloaded' | 'failed';
  generated_at: string;
  sent_at?: string;
  downloaded_at?: string;
}

export interface GenerateSingleCertificateRequest {
  template_id: number;
  event_id: number;
  game_id?: number;
  parent_id: number;
  child_id?: number;
  certificate_data: CertificateData;
  user_id: number; // Required by the API
}

export interface GenerateBulkCertificatesRequest {
  template_id: number;
  event_id: number;
  game_id?: number;
  certificate_type: string;
  include_no_shows?: boolean;
  participants: Array<{
    parent_id: number;
    child_id?: number;
    participant_name: string;
    additional_data?: Record<string, any>;
  }>;
}

// Event Participants Types
export interface EventParticipant {
  booking_id: number;
  booking_ref: string;
  parent_id: number;
  parent_name: string;
  email: string;
  additional_phone?: string;
  child_id: number;
  child_name: string;
  date_of_birth?: string;
  gender?: string;
  event_title: string;
  event_date: string;
  venue_name: string;
  game_name: string;
  game_id?: number;
  attendance_status?: string;
}

export interface EventParticipantsResponse {
  event_id: number;
  event_name: string;
  event_title: string;
  event_date: string;
  venue_name: string;
  city_name: string;
  total_participants: number;
  participants: EventParticipant[];
}

// File Upload Types
export interface BackgroundUploadResponse {
  success: boolean;
  file_path: string;
  filename: string;
  original_name?: string;
}

// Certificate Download Types
export interface CertificateDownloadResponse {
  html: string;
  certificate_id: number;
  filename: string;
  pdf_path: string;
  full_path: string;
}

// API Response Types
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form Types
export interface CertificateTemplateFormData {
  name: string;
  description: string;
  type: 'participation' | 'winner' | 'event_specific';
  certificate_title?: string;
  certificate_title_style?: CertificateTitleStyle; // Certificate title styling and positioning
  appreciation_text?: string; // Legacy field
  appreciation_text_style?: AppreciationTextStyle; // New structured appreciation text
  signature_image?: string;
  signature_style?: SignatureStyle; // Signature styling and positioning
  background_image?: string; // Legacy field
  background_style?: BackgroundStyle; // New structured background
  paper_size: 'a4' | 'letter' | 'a3';
  orientation: 'landscape' | 'portrait';
  fields: CertificateField[];
}

// Bulk Generation Progress
export interface BulkGenerationProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
  results: Array<{
    participant: EventParticipant;
    success: boolean;
    certificate?: GeneratedCertificate;
    error?: string;
  }>;
}

// Certificate List Item for display in UI
export interface CertificateListItem extends GeneratedCertificate {
  template_name?: string;
  template_type?: string;
  event_title?: string;
  event_date?: string;
  venue_name?: string;
  city_name?: string;
  certificate_number?: string;
  user_name?: string;
  user_email?: string;
  child_id?: number;
  child_name?: string;
  game_name?: string;
  parent_name?: string;
  parent_email?: string;
  raw_certificate_data?: any;
}
