
import React, { useState, useCallback, useRef } from 'react';
import { generatePosterImage, generateMarketingText } from './services/geminiService';
import { ImageUploadBox } from './components/ImageUploadBox';
import { LoadingSpinnerIcon, DownloadIcon } from './components/Icons';
import type { PosterInput, PosterResult, BusinessType } from './types';

const STYLES = {
    NAIL: ['Sang trọng & Quý phái (Luxury)', 'Valentine Lãng Mạn (Romantic)', 'Dễ thương & Pastel (Cute)', 'Nghệ thuật tối giản (Minimalist)', 'Lễ hội & Lấp lánh (Festival)'],
    FOOD: ['Tươi ngon & Healthy', 'Bùng nổ vị giác (Spicy/Hot)', 'Bữa tối lãng mạn (Fine Dining)', 'Đường phố nhộn nhịp (Street Food)', 'Truyền thống & Mộc mạc']
};

const App: React.FC = () => {
    // State
    const [businessType, setBusinessType] = useState<BusinessType>('NAIL');
    const [step, setStep] = useState<1 | 2>(1);
    
    const [inputImages, setInputImages] = useState<PosterInput>({
        productImage: null,
        logo: null,
        reference: null
    });

    const [brandName, setBrandName] = useState('Globen Nails');
    const [promotion, setPromotion] = useState('Valenty Erbjudande');
    const [selectedStyle, setSelectedStyle] = useState('');
    const [aspectRatio, setAspectRatio] = useState('3:4');

    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<PosterResult | null>(null);
    const resultSectionRef = useRef<HTMLDivElement>(null);

    const handleImageUpload = useCallback((type: keyof PosterInput, file: string | null) => {
        setInputImages(prev => ({ ...prev, [type]: file }));
    }, []);

    const handleGenerate = async () => {
        if (!inputImages.productImage) {
            alert("Vui lòng tải lên ảnh sản phẩm (Mẫu Nail hoặc Món ăn)");
            return;
        }

        setIsGenerating(true);
        setStep(2);
        setResult(null);

        // Mặc định style nếu không chọn
        const styleToUse = selectedStyle || STYLES[businessType][0];
        const finalBrandName = brandName || "Globen Nails";

        try {
            const [imageUrl, marketingContent] = await Promise.all([
                generatePosterImage(inputImages, businessType, finalBrandName, promotion, styleToUse, aspectRatio),
                generateMarketingText(businessType, finalBrandName, promotion, styleToUse)
            ]);

            setResult({
                imageUrl,
                content: marketingContent
            });

             setTimeout(() => {
                resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi tạo thiết kế. Vui lòng thử lại!");
            setStep(1);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = () => {
        if (!result?.imageUrl) return;
        const link = document.createElement('a');
        link.href = result.imageUrl;
        link.download = `poster-${businessType}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Đã copy nội dung!");
    };

    return (
        <div className="bg-gray-950 text-white min-h-screen font-sans selection:bg-pink-500 selection:text-white pb-20">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* HEADER */}
                <header className="text-center mb-10 relative">
                     <div className={`absolute top-0 left-0 w-full h-full opacity-10 blur-3xl rounded-full z-0 pointer-events-none ${businessType === 'NAIL' ? 'bg-pink-500' : 'bg-orange-500'}`}></div>
                    <h1 className="relative z-10 text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 uppercase tracking-tight mb-2">
                        TRẦN HOÀN AI POSTER
                    </h1>
                    <p className="text-gray-400 text-lg uppercase tracking-widest font-light">Chuyên gia thiết kế cho Tiệm Nail & Nhà Hàng (Thị trường Thụy Điển)</p>
                </header>

                {/* MODE SWITCHER */}
                <div className="flex justify-center gap-6 mb-12">
                    <button 
                        onClick={() => { setBusinessType('NAIL'); setSelectedStyle(''); }}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 border ${businessType === 'NAIL' ? 'bg-pink-600 border-pink-400 shadow-lg shadow-pink-900/50' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                    >
                        💅 NAIL SALON
                    </button>
                    <button 
                         onClick={() => { setBusinessType('FOOD'); setSelectedStyle(''); }}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 border ${businessType === 'FOOD' ? 'bg-orange-600 border-orange-400 shadow-lg shadow-orange-900/50' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                    >
                        🍔 NHÀ HÀNG
                    </button>
                </div>

                {/* MAIN FORM */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: INPUTS */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className={`font-bold text-xl mb-4 uppercase ${businessType === 'NAIL' ? 'text-pink-400' : 'text-orange-400'}`}>1. Tải ảnh nguyên liệu</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                     <ImageUploadBox 
                                        title={businessType === 'NAIL' ? "ẢNH MẪU NAIL" : "ẢNH MÓN ĂN"} 
                                        label="Bắt buộc - Ảnh chính" 
                                        onUpload={(f) => handleImageUpload('productImage', f)} 
                                    />
                                </div>
                                <ImageUploadBox title="LOGO QUÁN" label="Nên có (Tự động làm to & bóng đổ)" onUpload={(f) => handleImageUpload('logo', f)} />
                                <ImageUploadBox title="STYLE MẪU" label="Tham khảo" onUpload={(f) => handleImageUpload('reference', f)} />
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                             <h3 className={`font-bold text-xl mb-4 uppercase ${businessType === 'NAIL' ? 'text-pink-400' : 'text-orange-400'}`}>2. Thông tin Poster</h3>
                             <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Tên thương hiệu / Quán</label>
                                    <input 
                                        type="text" 
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        placeholder="Ví dụ: Globen Nails"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-white focus:ring-0 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Chương trình / Slogan (In lên ảnh)</label>
                                    <input 
                                        type="text" 
                                        value={promotion}
                                        onChange={(e) => setPromotion(e.target.value)}
                                        placeholder="Ví dụ: Valenty Erbjudande"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-white focus:ring-0 transition"
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STYLE & GENERATE */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-full flex flex-col">
                            <h3 className={`font-bold text-xl mb-4 uppercase ${businessType === 'NAIL' ? 'text-pink-400' : 'text-orange-400'}`}>3. Chọn phong cách thiết kế</h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                {STYLES[businessType].map((style, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`p-4 rounded-lg text-sm font-bold text-left border transition-all ${selectedStyle === style ? 'bg-white text-black border-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8">
                                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Tỷ lệ khung hình</label>
                                <div className="flex gap-3">
                                    {['3:4', '1:1', '9:16', '16:9'].map(r => (
                                        <button 
                                            key={r}
                                            onClick={() => setAspectRatio(r)}
                                            className={`px-4 py-2 rounded font-bold text-sm border ${aspectRatio === r ? (businessType === 'NAIL' ? 'bg-pink-600 border-pink-600' : 'bg-orange-600 border-orange-600') : 'bg-gray-800 border-gray-700'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className={`w-full py-4 rounded-xl font-black text-xl uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${businessType === 'NAIL' ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500'}`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <LoadingSpinnerIcon /> ĐANG THIẾT KẾ...
                                        </>
                                    ) : (
                                        'TẠO POSTER NGAY'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RESULT SECTION */}
                {(isGenerating || result) && (
                    <section ref={resultSectionRef} className="mt-16 border-t border-gray-800 pt-16 animate-fade-in-up">
                        <div className="flex items-center justify-center gap-3 mb-10">
                             <h2 className="text-3xl font-extrabold text-white uppercase">Sản Phẩm Hoàn Thiện</h2>
                        </div>

                        {isGenerating && (
                             <div className="text-center py-20">
                                <div className="inline-block relative w-20 h-20 mb-4">
                                    <div className={`absolute top-0 left-0 w-full h-full border-4 rounded-full opacity-20 ${businessType === 'NAIL' ? 'border-pink-500' : 'border-orange-500'}`}></div>
                                    <div className={`absolute top-0 left-0 w-full h-full border-4 rounded-full animate-spin border-t-transparent ${businessType === 'NAIL' ? 'border-pink-500' : 'border-orange-500'}`}></div>
                                </div>
                                <p className="text-gray-400">AI đang vẽ poster, gắn logo và viết content song ngữ...</p>
                             </div>
                        )}

                        {!isGenerating && result && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                {/* POSTER IMAGE */}
                                <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-2xl">
                                    <img src={result.imageUrl} alt="AI Poster" className="w-full h-auto rounded-xl mb-4" />
                                    <button 
                                        onClick={downloadImage}
                                        className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <DownloadIcon /> TẢI ẢNH POSTER
                                    </button>
                                </div>

                                {/* MARKETING CONTENT */}
                                <div className="space-y-8">
                                    {/* VIETNAMESE CONTENT */}
                                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative">
                                        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">TIẾNG VIỆT</div>
                                        <h3 className={`font-bold text-lg uppercase mb-4 text-white`}>
                                            🇻🇳 Gợi ý Marketing (VN)
                                        </h3>
                                        
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 uppercase mb-2">Headlines</p>
                                            {result.content.headlines.map((hl, i) => (
                                                <div key={i} className="flex items-center justify-between bg-black/30 p-2 rounded mb-2 border border-gray-700">
                                                    <p className="text-gray-300 text-sm font-medium">{hl}</p>
                                                    <button onClick={() => copyToClipboard(hl)} className="text-xs text-gray-500 hover:text-white uppercase font-bold">Copy</button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                                            <p className="text-gray-300 whitespace-pre-line leading-relaxed text-sm">
                                                {result.content.facebookCaption}
                                            </p>
                                            <p className="text-blue-400 mt-2 text-xs font-medium">{result.content.hashtags}</p>
                                        </div>
                                         <button 
                                            onClick={() => copyToClipboard(`${result.content.facebookCaption}\n\n${result.content.hashtags}`)}
                                            className="mt-2 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded transition-colors"
                                        >
                                            Copy Caption VN
                                        </button>
                                    </div>

                                    {/* SWEDISH CONTENT */}
                                    <div className="bg-gray-900 border border-blue-900/50 rounded-xl p-6 relative shadow-lg shadow-blue-900/20">
                                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">SWEDEN (SE)</div>
                                        <h3 className={`font-bold text-lg uppercase mb-4 text-white`}>
                                            🇸🇪 Marketing Content (Svenska)
                                        </h3>
                                        
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 uppercase mb-2">Rubriker (Headlines)</p>
                                            {result.content.headlinesSE.map((hl, i) => (
                                                <div key={i} className="flex items-center justify-between bg-black/30 p-2 rounded mb-2 border border-gray-700">
                                                    <p className="text-gray-300 text-sm font-medium italic">{hl}</p>
                                                    <button onClick={() => copyToClipboard(hl)} className="text-xs text-gray-500 hover:text-white uppercase font-bold">Copy</button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                                            <p className="text-gray-300 whitespace-pre-line leading-relaxed text-sm italic">
                                                {result.content.facebookCaptionSE}
                                            </p>
                                            <p className="text-blue-400 mt-2 text-xs font-medium">{result.content.hashtags}</p>
                                        </div>
                                         <button 
                                            onClick={() => copyToClipboard(`${result.content.facebookCaptionSE}\n\n${result.content.hashtags}`)}
                                            className="mt-2 text-xs bg-blue-900 hover:bg-blue-800 border border-blue-700 text-white px-3 py-1 rounded transition-colors"
                                        >
                                            Kopiera Text (Copy SE)
                                        </button>
                                    </div>

                                </div>
                            </div>
                        )}
                    </section>
                )}

                <footer className="text-center mt-20 pt-8 border-t border-gray-800 text-gray-500 text-sm">
                    <p>Powered by <span className="text-white font-bold text-lg text-yellow-500">TRẦN HOÀN AI</span></p>
                    <p className="text-xs mt-1">Chuyên gia Marketing & Thiết kế tự động</p>
                </footer>
            </main>
        </div>
    );
};

export default App;
