
export type BusinessType = 'NAIL' | 'FOOD';

export interface PosterInput {
    productImage: string | null; // Ảnh mẫu nail hoặc món ăn
    logo: string | null;         // Logo quán
    reference: string | null;    // Ảnh style mẫu muốn bắt chước
}

export interface MarketingContent {
    headlines: string[];       // Gợi ý tiêu đề giật tít (VN)
    headlinesSE: string[];     // Gợi ý tiêu đề tiếng Thụy Điển
    facebookCaption: string;   // Nội dung bài đăng FB (VN)
    facebookCaptionSE: string; // Nội dung bài đăng FB (SE)
    hashtags: string;
}

export interface PosterResult {
    imageUrl: string;
    content: MarketingContent;
}
