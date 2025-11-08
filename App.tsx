import React, { useState, useCallback } from 'react';
import { FormData, ImageFile, FormInput } from './types';
import { generateFashionShoot } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import FormField from './components/FormField';
import SubmitButton from './components/SubmitButton';
import GeneratedImage from './components/GeneratedImage';

const App: React.FC = () => {
  const formInputs: FormInput[] = [
    { id: 'brand_name', label: 'Brand Name (Neon Sign)', type: 'text', placeholder: 'e.g. Vega', required: true },
    { id: 'session_style', label: 'Choose Photo Session Style', type: 'dropdown', options: ["Luxury Studio (Silk Curtains + Perfume Bottles)", "Modern Neon Lounge (Glossy Floors + Pink Neon)", "Dreamy Pastel Bedroom (Fairy Lights + Plush Decor)", "Minimal White Studio (Seamless + Gradient Light)", "Soft Glamour Lighting (Back Rim + Glow)", "Elegant Marble Room (Soft daylight + reflective floor)", "Chic Apartment Loft (Neutral tones + natural light)", "Vintage Blush Studio (Warm filter + soft shadows)", "Industrial Chic Loft (Exposed Brick + Metal Pipes)", "Futuristic Sci-Fi Set (Holographic Panels + Blue LEDs)", "Enchanted Forest (Misty Woods + Sunbeams)", "Opulent Rococo Palace (Gold Gilt + Velvet Drapes)", "Urban Rooftop at Golden Hour (Cityscape + Warm Sunset)", "Surrealist Dreamscape (Floating Objects + Impossible Geometry)", "Art Deco Speakeasy (Geometric Patterns + Dim Lighting)", "Bohemian Desert Oasis (Macrame + Cacti + Sand Dunes)"] },
    { id: 'mannequin_type', label: 'Mannequin Color', type: 'dropdown', options: ["Gold", "White", "Silver Chrome", "Rose Gold", "Matte Black"] },
    { id: 'camera_angle', label: 'Camera Angle', type: 'dropdown', options: ["Full-Body Front View", "Dynamic Full-Body Angles", "Full-Body High Angle", "Full-Body Low Angle", "Full-Body Dutch Angle"] },
    { id: 'outfit_color', label: 'Outfit Color (Optional)', type: 'text', placeholder: 'e.g. Baby Blue or #ffc9a7', required: false },
    { id: 'aspect_ratio', label: 'Aspect Ratio', type: 'dropdown', options: ["1:1", "3:4", "9:16", "16:9"] },
    { id: 'neon_position', label: 'Neon Position', type: 'dropdown', options: ["behind", "beside", "above"] },
    { id: 'quality', label: 'Quality', type: 'dropdown', options: ["standard", "high", "ultra"] },
    { id: 'image_count', label: 'Number of Images', type: 'number', min: 1, max: 4 },
  ];

  const [formData, setFormData] = useState<FormData>({
    brand_name: 'Ve',
    session_style: 'Luxury Studio (Silk Curtains + Perfume Bottles)',
    outfit_color: '',
    aspect_ratio: '3:4',
    neon_position: 'behind',
    quality: 'high',
    image_count: 1,
    mannequin_type: 'Gold',
    camera_angle: 'Full-Body Front View',
  });
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const isNumber = type === 'number';
    
    setFormData(prev => ({
      ...prev,
      [id]: isCheckbox ? (e.target as HTMLInputElement).checked : (isNumber ? parseInt(value, 10) : value)
    }));
  }, []);

  const handleImageChange = useCallback((newImages: ImageFile[]) => {
    setReferenceImages(newImages);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceImages.length === 0) {
      setError('Please upload at least one reference outfit image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    // Create placeholder skeletons
    setGeneratedImages(Array(formData.image_count).fill('loading'));

    try {
      const result = await generateFashionShoot(formData, referenceImages);
      setGeneratedImages(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      setGeneratedImages([]); // Clear skeletons on error
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || referenceImages.length === 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row">
      {/* Left Panel: Form */}
      <aside className="w-full lg:w-1/3 xl:w-1/4 p-6 lg:p-8 space-y-6 bg-white/60 lg:overflow-y-auto lg:h-screen sticky top-0">
        <Header />
        <form onSubmit={handleSubmit} className="space-y-6 pb-24 lg:pb-0">
          <ImageUploader 
            images={referenceImages} 
            onImagesChange={handleImageChange}
            helpText="Upload one or more reference outfit images (PNG, JPG, WEBP up to 10MB each)."
          />
          {formInputs.map(input => (
            <FormField
              key={input.id}
              {...input}
              value={formData[input.id as keyof FormData]}
              onChange={handleInputChange}
            />
          ))}
          {error && <div className="text-red-500 bg-red-100 p-3 rounded-md text-sm">{error}</div>}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
             <SubmitButton isLoading={isLoading} isDisabled={isSubmitDisabled} />
          </div>
          <div className="hidden lg:block pt-4">
             <SubmitButton isLoading={isLoading} isDisabled={isSubmitDisabled} />
          </div>
        </form>
      </aside>

      {/* Right Panel: Results */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="h-full">
          {generatedImages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-2xl">
              <div>
                <p className="text-2xl font-semibold">Your Photoshoot Awaits</p>
                <p className="mt-2">Generated images will appear here.</p>
              </div>
            </div>
          )}
          {generatedImages.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-start
              ${formData.aspect_ratio === '16:9' ? 'xl:grid-cols-2' : 'xl:grid-cols-3'}`}>
              {generatedImages.map((imageSrc, index) => (
                <GeneratedImage
                  key={index}
                  src={imageSrc === 'loading' ? undefined : imageSrc}
                  isLoading={imageSrc === 'loading'}
                  aspectRatio={formData.aspect_ratio}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;