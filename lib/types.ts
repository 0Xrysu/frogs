export interface FrogAttribute {
  trait_type: string;
  value: string;
}

export interface FrogMetadata {
  name: string;
  description: string;
  image: string;
  attributes: FrogAttribute[];
  external_url?: string;
  created_at: string;
}

export interface FrogFormData {
  name: string;
  background: string;
  color: string;
  scienceName: string;
  origin: string;
  toxicity: string;
  conversation: string;
  rarityTier: string;
}
