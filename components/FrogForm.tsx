'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FrogFormData } from '@/lib/types';
import { FiChevronDown } from 'react-icons/fi';

interface FrogFormProps {
  onSuccess: () => void;
}

interface CustomSelectProps {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
}

function CustomSelect({ label, name, value, options, placeholder, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-background text-left flex items-center justify-between"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedLabel || placeholder}
        </span>
        <FiChevronDown className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-background border border-border rounded-lg shadow-lg">
          <div className="max-h-40 overflow-y-auto">
            {options.length === 0 ? (
              <div className="text-center text-muted-foreground py-3">Empty</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`block w-full text-left px-3 py-2 hover:bg-muted text-sm text-foreground ${value === option.value ? 'bg-muted' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FrogForm({ onSuccess }: FrogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'sending' | 'processing' | 'completed' | 'failed' | 'wrong-key'>('idle');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [secretKey, setSecretKey] = useState('');
  const [formData, setFormData] = useState<FrogFormData>({
    name: '',
    background: '',
    color: '',
    scienceName: '',
    origin: '',
    toxicity: '',
    conversation: '',
    rarityTier: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check if form is complete
  const isFormComplete = () => {
    return (
      image &&
      formData.name.trim() &&
      formData.scienceName.trim() &&
      formData.origin.trim() &&
      formData.background.trim() &&
      formData.color.trim() &&
      formData.toxicity &&
      formData.rarityTier &&
      formData.conversation &&
      secretKey.trim()
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormComplete()) return;

    setLoading(true);
    setLoadingState('sending');

    try {
      const formDataObj = new FormData();
      formDataObj.append('image', image!);
      formDataObj.append('data', JSON.stringify(formData));

      setLoadingState('processing');

      const response = await fetch(`/api/frogs/add?key=${encodeURIComponent(secretKey)}`, {
        method: 'POST',
        body: formDataObj,
      });

      if (response.status === 401) {
        setLoadingState('wrong-key');
        setLoading(false);
        
        // Reset after 2 seconds
        setTimeout(() => {
          setLoadingState('idle');
        }, 2000);
        return;
      }

      if (!response.ok) throw new Error('Failed to upload frog');

      setLoadingState('completed');
      
      // Auto redirect after 1.5 seconds
      setTimeout(() => {
        router.push('/');
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error uploading frog:', error);
      setLoadingState('failed');
      setLoading(false);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setLoadingState('idle');
      }, 2000);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-background text-foreground placeholder:text-muted-foreground";

  const toxicityOptions = [
    { value: 'Non-toxic', label: 'Non-toxic' },
    { value: 'Mildly Toxic', label: 'Mildly Toxic' },
    { value: 'Toxic', label: 'Toxic' },
    { value: 'Highly Toxic', label: 'Highly Toxic' },
  ];

  const rarityOptions = [
    { value: 'Common', label: 'Common' },
    { value: 'Uncommon', label: 'Uncommon' },
    { value: 'Rare', label: 'Rare' },
    { value: 'Epic', label: 'Epic' },
    { value: 'Legendary', label: 'Legendary' },
  ];

  const conservationOptions = [
    { value: 'Extinct (EX)', label: 'Extinct (EX) - None left anywhere' },
    { value: 'Extinct in the Wild (EW)', label: 'Extinct in the Wild (EW) - Only alive in zoos/captivity' },
    { value: 'Critically Endangered (CR)', label: 'Critically Endangered (CR) - Very close to disappearing' },
    { value: 'Endangered (EN)', label: 'Endangered (EN) - High risk of extinction soon' },
    { value: 'Vulnerable (VU)', label: 'Vulnerable (VU) - Population is dropping fast' },
    { value: 'Near Threatened (NT)', label: 'Near Threatened (NT) - Starting to have trouble' },
    { value: 'Least Concern (LC)', label: 'Least Concern (LC) - Safe and common' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Frog Image</label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          {imagePreview && (
            <div className="w-20 h-20 border border-border rounded-lg overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Frog Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Red-Eyed Tree Frog" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Science Name (Binomial)</label>
        <input type="text" name="scienceName" value={formData.scienceName} onChange={handleInputChange} placeholder="e.g., Agalychnis callidryas" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Origin (Geographic Location)</label>
        <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} placeholder="e.g., Central America" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Background</label>
        <input type="text" name="background" value={formData.background} onChange={handleInputChange} placeholder="e.g., Rainforest" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Color</label>
        <input type="text" name="color" value={formData.color} onChange={handleInputChange} placeholder="e.g., Red, Green, Blue" className={inputClass} />
      </div>

      <CustomSelect label="Toxicity Level" name="toxicity" value={formData.toxicity} options={toxicityOptions} placeholder="Select toxicity level" onChange={(v) => handleSelectChange('toxicity', v)} />
      <CustomSelect label="Rarity Tier" name="rarityTier" value={formData.rarityTier} options={rarityOptions} placeholder="Select rarity tier" onChange={(v) => handleSelectChange('rarityTier', v)} />
      <CustomSelect label="Conservation Status (IUCN Red List)" name="conversation" value={formData.conversation} options={conservationOptions} placeholder="Select conservation status" onChange={(v) => handleSelectChange('conversation', v)} />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Secret Key</label>
        <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="Enter the secret key to authorize submission" className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={
        !isFormComplete() ||
        loading ||
        loadingState === 'wrong-key' ||
        loadingState === 'completed' ||
        loadingState === 'failed'
        }
        className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-muted dark:hover:bg-muted/80 dark:disabled:opacity-50 text-foreground font-semibold py-2 px-4 rounded-md transition-colors border border-border"
      >
        {loadingState === 'idle' && 'Send to Archive'}
        {loadingState === 'sending' && 'Sending to the swamp...'}
        {loadingState === 'processing' && 'Frog is on its way...'}
        {loadingState === 'completed' && 'Frog delivered successfully'}
        {loadingState === 'failed' && 'Something went wrong'}
        {loadingState === 'wrong-key' && 'Invalid Secret Key'}
      </button>
    </form>
  );
}
