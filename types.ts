export interface FormData {
  brand_name: string;
  session_style: string;
  outfit_color: string;
  aspect_ratio: string;
  neon_position: string;
  quality: string;
  image_count: number;
  mannequin_type: string;
  camera_angle: string;
  mannequin_pose: string;
  accessories: string;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
}

export interface FormInput {
  id: string;
  label: string;
  type: 'text' | 'dropdown' | 'number' | 'boolean';
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}