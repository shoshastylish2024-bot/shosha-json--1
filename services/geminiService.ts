import { GoogleGenAI, Modality } from "@google/genai";
import { FormData, ImageFile } from '../types';
import { toBase64 } from "../utils/fileUtils";

const PROMPT_TEMPLATE = `**Task:** Create a hyperrealistic, professional fashion studio photograph for a Vogue-style editorial.

**Primary Subject:** A {{mannequin_description}} wearing an outfit. The outfit must be an **exact, 100% accurate replication** of the one in the uploaded reference images. Preserve every detail: fabric texture, embroidery, lace, transparency, and fit.
- **Pose:** {{mannequin_pose_text}}
{{accessories_text}}

**Composition & Framing:**
- This MUST be a **full-body shot**, capturing the mannequin from head to toe.
- {{camera_angle_text}}
- The composition should be flawless, with professional-level framing and balance.

**Lighting & Atmosphere:**
- **Lighting:** Cinematic, multi-point studio lighting. Use a soft key light, gentle fill light, and a warm back rim light (glow) to create depth and highlight the mannequin's contours.
- **Background:** A luxury, fashion-oriented environment described as: {{session_style}}.
- **Branding:** Integrate a softly glowing neon sign that reads “{{brand_name}}”. **The neon color should intelligently complement the outfit's color palette.** It should be positioned {{neon_position}} and blended naturally into the scene's lighting.

**Technical Specifications:**
- **Camera:** Emulate a high-end DSLR shot (e.g., Canon EOS R5) with a sharp prime lens (e.g., 85mm f/1.2).
- **Aesthetics:** The final image must be ultra-realistic, with crisp details, rich textures, and perfect color grading.
- **Aspect Ratio:** {{aspect_ratio}}.
- **Color Modification:** {{outfit_color_text}}

**Output:** Generate 1 image at {{quality}} quality, ensuring all instructions are followed meticulously.`;

const getMannequinDescription = (type: string): string => {
    switch (type) {
        case 'White':
            return 'female mannequin with an elegant, curvy, glossy white surface and realistic proportions';
        case 'Silver Chrome':
            return 'female mannequin with an elegant, curvy, reflective silver chrome surface and realistic proportions';
        case 'Rose Gold':
            return 'female mannequin with an elegant, curvy, reflective rose gold metallic surface and realistic proportions';
        case 'Matte Black':
            return 'female mannequin with an elegant, curvy, non-reflective matte black surface and minimalist proportions';
        case 'Gold':
        default:
            return 'female golden mannequin with an elegant, curvy, reflective golden surface and realistic proportions';
    }
};

const getCameraAngleText = (angle: string): string => {
    switch (angle) {
        case 'Dynamic Full-Body Angles':
            return 'Use a dynamic, creative camera angle for the shot. Avoid a simple, static front view.';
        case 'Full-Body High Angle':
            return 'The photo is taken from a high camera angle, looking down at the mannequin.';
        case 'Full-Body Low Angle':
            return 'The photo is taken from a low camera angle, looking up at the mannequin to create a sense of grandeur and power.';
        case 'Full-Body Dutch Angle':
             return 'Use a Dutch angle (tilted camera) for a dramatic, edgy, and high-fashion effect.';
        case 'Full-Body Front View':
        default:
            return 'The mannequin is framed directly from the front, centered in the shot.';
    }
};

const getMannequinPoseText = (pose: string): string => {
    switch (pose) {
        case 'Standing Power Pose':
            return 'The mannequin is in a confident, strong standing power pose, with feet slightly apart and a straight posture.';
        case 'Elegant Walking Motion':
            return 'The mannequin is captured in mid-stride, conveying an elegant walking motion as if on a runway.';
        case 'Relaxed Seated Pose':
            return 'The mannequin is in a relaxed, natural seated pose on a minimalist stool or chair that complements the scene.';
        case 'Dynamic Turning Pose':
            return 'The mannequin is captured in a dynamic turning motion, showcasing the outfit\'s flow and movement.';
        case 'Artistic Abstract Pose':
            return 'The mannequin is in an artistic, abstract, high-fashion pose that is unconventional and visually striking.';
        case 'Standard Studio Pose':
        default:
            return 'The mannequin is in a standard, neutral studio pose, standing straight and facing forward.';
    }
};


export async function generateFashionShoot(formData: FormData, referenceImages: ImageFile[]): Promise<string[]> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const mannequinDescription = getMannequinDescription(formData.mannequin_type);
  const cameraAngleText = getCameraAngleText(formData.camera_angle);
  const mannequinPoseText = getMannequinPoseText(formData.mannequin_pose);
  const outfitColorText = formData.outfit_color ? `If an outfit color is provided, recolor the outfit to ${formData.outfit_color} (apply to all fabrics consistently).` : "The outfit color should not be changed.";
  const accessoriesText = formData.accessories ? `- **Accessories:** The mannequin should also be styled with the following accessories: ${formData.accessories}. Integrate them naturally.` : "";


  let prompt = PROMPT_TEMPLATE
    .replace('{{mannequin_description}}', mannequinDescription)
    .replace('{{mannequin_pose_text}}', mannequinPoseText)
    .replace('{{accessories_text}}', accessoriesText)
    .replace('{{camera_angle_text}}', cameraAngleText)
    .replace('{{brand_name}}', formData.brand_name)
    .replace('{{session_style}}', formData.session_style)
    .replace('{{aspect_ratio}}', formData.aspect_ratio)
    .replace('{{neon_position}}', formData.neon_position)
    .replace('{{quality}}', formData.quality)
    .replace('{{outfit_color_text}}', outfitColorText);
    
  const imageParts = await Promise.all(
    referenceImages.map(async (img) => {
      const base64Data = await toBase64(img.file);
      return {
        inlineData: {
          data: base64Data,
          mimeType: img.file.type,
        },
      };
    })
  );

  const textPart = { text: prompt };
  
  const contents = {
      parts: [...imageParts, textPart]
  };
  
  const generationPromises = [];
  for (let i = 0; i < formData.image_count; i++) {
    generationPromises.push(
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
        config: {
          responseModalities: [Modality.IMAGE],
        },
      })
    );
  }

  const responses = await Promise.all(generationPromises);
  
  const imageUrls = responses.map(response => {
    // Fix: Add robust checking for the Gemini API response to prevent runtime errors.
    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`Image generation was blocked. Reason: ${blockReason}`);
      }
      throw new Error("No image generated. The response from the model was invalid.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image data found in Gemini response.");
  });
  
  return imageUrls;
}