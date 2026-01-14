
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { PosterInput, BusinessType, MarketingContent } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const fileToGenerativePart = (base64Data: string) => {
    const match = base64Data.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid base64 image data format");
    }
    return {
        inlineData: {
            mimeType: match[1],
            data: match[2]
        },
    };
};

// 1. Tạo Content Marketing (Caption + Headlines) - Song ngữ
export const generateMarketingText = async (
    type: BusinessType,
    brandName: string,
    promotion: string,
    style: string
): Promise<MarketingContent> => {
    // Nếu brandName trống hoặc chung chung, ưu tiên nhắc đến Globen Nails cho ngữ cảnh demo
    const brand = brandName || "Globen Nails";
    
    const prompt = `
        Bạn là Chuyên gia Marketing quốc tế, chuyên thị trường Việt Nam và Thụy Điển (Sweden).
        Ngành hàng: ${type === 'NAIL' ? 'Nail Salon / Beauty' : 'Restaurant / Food'}.
        
        Thông tin quán:
        - Thương hiệu: "${brand}"
        - Promotion: "${promotion}"
        - Phong cách: "${style}"

        Hãy viết nội dung quảng cáo song ngữ. 
        Lưu ý: 
        - Với thị trường Thụy Điển, dùng từ ngữ sang trọng, lôi cuốn (ví dụ: "Valenty Erbjudande" cho dịp lễ, "Lyx", "Skönhet").
        - Văn phong: Quyến rũ, đẳng cấp, kêu gọi hành động (Urgency).
        
        Trả về JSON format:
        1. "headlines": 3 tiêu đề ngắn tiếng Việt (VD: "Tình Yêu Thăng Hoa – Ưu Đãi Đẳng Cấp").
        2. "headlinesSE": 3 tiêu đề ngắn tiếng Thụy Điển tương ứng (VD: "Valenty Erbjudande – Lyxiga Naglar").
        3. "facebookCaption": Bài đăng tiếng Việt. Nhấn mạnh dịch vụ 5 sao, kỹ thuật viên chuyên nghiệp.
        4. "facebookCaptionSE": Bài đăng tiếng Thụy Điển. Nhấn mạnh chất lượng, không gian thư giãn.
        5. "hashtags": Hashtag mix cả tiếng Việt và tiếng Thụy Điển + tiếng Anh.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
                    headlinesSE: { type: Type.ARRAY, items: { type: Type.STRING } },
                    facebookCaption: { type: Type.STRING },
                    facebookCaptionSE: { type: Type.STRING },
                    hashtags: { type: Type.STRING }
                }
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text) as MarketingContent;
    }
    throw new Error("Failed to generate marketing text");
};

// 2. Tạo Ảnh Poster Quảng Cáo - Logo to, Bóng đổ
export const generatePosterImage = async (
    input: PosterInput,
    type: BusinessType,
    brandName: string,
    promotion: string,
    style: string,
    aspectRatio: string
): Promise<string> => {
    
    if (!input.productImage) throw new Error("Missing product image");
    const brand = brandName || "Globen Nails";

    // Xây dựng prompt thiết kế poster
    let prompt = `
        Design a High-End Advertising Poster for "${brand}" (${type === 'NAIL' ? 'Nail Salon' : 'Restaurant'}).
        Target Market: Sweden & International.
        
        Visual Style: ${style}. 
        Core Subject: The product image provided. Retouch to perfection (8k resolution, magazine quality).
        
        CRITICAL TEXT OVERLAY INSTRUCTIONS:
        - Embed short, elegant advertising text directly onto the image.
        - Text suggestions: "Valenty Erbjudande", "Tình Yêu Thăng Hoa", "Valentine Special", or the brand name "${brand}".
        - Typography: Gold foil, Neon, or Elegant Serif fonts depending on the style. Make it look like a finished advertisement.

        LOGO INSTRUCTIONS (VERY IMPORTANT):
        - If a logo is provided: It MUST be LARGE, BOLD, and PROMINENT.
        - Apply a strong DROP SHADOW behind the logo to make it pop out powerfully against the background.
        - Position: Top center or Top corner, highly visible. Do not hide the logo.
        
        Composition:
        - Professional commercial layout.
        - Lighting: Dramatic, Studio, Volumetric.
        - Aspect Ratio: ${aspectRatio}.
    `;

    const parts: any[] = [{ text: prompt }];
    parts.push(fileToGenerativePart(input.productImage));

    if (input.logo) {
        parts.push(fileToGenerativePart(input.logo));
        parts[0].text += " [IMAGE 2 IS THE LOGO] -> Place this logo prominently on the poster as instructed above. Increase scale and add shadow.";
    }
    
    if (input.reference) {
        parts.push(fileToGenerativePart(input.reference));
        parts[0].text += " Use the provided reference image (Image 3) as inspiration for color and layout.";
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && firstPart.inlineData) {
            return `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;
        }
        throw new Error("No image returned");
    } catch (e) {
        console.error("Poster gen error:", e);
        throw e;
    }
};
