import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { parseItem, type DiabloItem } from '../../utils/ItemParser';

const OcrUploader: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<string>('');
    const [ocrResult, setOcrResult] = useState<string>('');
    const [parsedItem, setParsedItem] = useState<DiabloItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const file = e.clipboardData.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const imgUrl = event.target.result as string;
                setImage(imgUrl);
                // 이미지 로드 후 캔버스에 그리기 (전처리 준비)
                drawImageToCanvas(imgUrl);
                setParsedItem(null); // 새 이미지 로드 시 기존 결과 초기화
                setOcrResult('');
                setProgress('');
            }
        };
        reader.readAsDataURL(file);
    };

    const drawImageToCanvas = (imgUrl: string) => {
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // 캔버스 크기 설정
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // 원본 그리기
                    ctx.drawImage(img, 0, 0);

                    // 전처리 (Grayscale & Contrast)
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        // Grayscale
                        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

                        // Contrast (간단한 임계값 처리로 이진화 효과)
                        // const contrastFactor = 1.5; // 대비 조절 계수
                        // let color = avg * contrastFactor;
                        // color = color > 255 ? 255 : color;

                        // Binarization (Thresholding)
                        const threshold = 160; // 임계값 조절 필요
                        const color = avg > threshold ? 255 : 0;

                        data[i] = color;     // R
                        data[i + 1] = color; // G
                        data[i + 2] = color; // B
                    }

                    // 전처리된 이미지 다시 그리기
                    ctx.putImageData(imageData, 0, 0);
                }
            }
        };
        img.src = imgUrl;
    };

    const handleExtractText = async () => {
        if (!canvasRef.current) return;
        setIsProcessing(true);
        setOcrResult('');
        setParsedItem(null);
        setProgress('OCR 엔진 초기화 중...');

        try {
            const worker = await createWorker('kor+eng', 1, {
                logger: (m: any) => {
                    if (m.status === 'recognizing text') {
                        setProgress(`텍스트 인식 중... ${(m.progress * 100).toFixed(0)}%`);
                    } else {
                        setProgress(m.status);
                    }
                }
            });

            setProgress('인식 시작...');
            // 전처리된 캔버스 이미지 사용
            const { data: { text } } = await worker.recognize(canvasRef.current);

            setOcrResult(text);

            // 파싱 실행
            const itemElement = parseItem(text);
            setParsedItem(itemElement);

            await worker.terminate();
        } catch (error) {
            console.error("OCR Error:", error);
            setOcrResult("오류가 발생했습니다. 개발자 도구 콘솔을 확인해주세요.");
        } finally {
            setIsProcessing(false);
            setProgress('');
        }
    };

    return (
        <div
            className="ocr-uploader-container text-gray-800"
            onPaste={handlePaste}
            tabIndex={0} // for paste event
            style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}
        >
            <h2 className="text-2xl font-bold mb-4 text-white">디아블로 4 아이템 스크린샷 업로드</h2>
            <div
                className="drop-zone bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: '2px dashed #cccccc',
                    borderRadius: '10px',
                    padding: '40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <p className="text-gray-600 dark:text-gray-300">이미지를 드래그 앤 드롭하거나 클릭하여 업로드하세요.</p>
                <p style={{ fontSize: '0.8em', color: '#999' }}>(Ctrl+V로 붙여넣기도 가능합니다)</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {image && (
                    <div className="preview-section flex-1 text-center">
                        <h3 className="text-xl font-semibold mb-2 text-white">전처리된 이미지</h3>
                        <div className="overflow-hidden rounded-lg border border-gray-600 bg-black">
                            <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '500px' }} />
                        </div>
                    </div>
                )}

                {parsedItem && (
                    <div className="result-preview flex-1">
                        <h3 className="text-xl font-semibold mb-2 text-white">분석 결과</h3>
                        <div className="bg-gray-900 border border-gray-600 p-4 rounded-lg shadow-lg text-white">
                            <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-2">
                                <div>
                                    <h4 className="text-yellow-500 font-bold text-lg">{parsedItem.name}</h4>
                                    <span className="text-sm text-gray-400">{parsedItem.type}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-orange-400 font-bold">위력 {parsedItem.power}</div>
                                    <div className="text-xs text-gray-500">요구 레벨: {parsedItem.requiredLevel}</div>
                                </div>
                            </div>

                            <ul className="space-y-2">
                                {parsedItem.options.map((opt, idx) => (
                                    <li key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-300">{opt.name}</span>
                                        <span className="text-blue-400 font-mono">{opt.value}</span>
                                    </li>
                                ))}
                                {parsedItem.options.length === 0 && (
                                    <li className="text-gray-500 italic text-sm">옵션을 찾지 못했습니다.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="actions text-center mt-6">
                <button
                    onClick={handleExtractText}
                    disabled={!image || isProcessing}
                    className={`px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-md ${!image || isProcessing
                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform hover:scale-105'
                        }`}
                >
                    {isProcessing ? '분석 중...' : '아이템 정보 추출'}
                </button>
            </div>

            {progress && <p className="text-center mt-4 text-blue-400 animate-pulse">{progress}</p>}

            {ocrResult && (
                <div className="result-section bg-gray-800 p-4 rounded-lg mt-8 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-2 text-gray-400">원본 텍스트 (Debug)</h3>
                    <pre className="whitespace-pre-wrap text-left text-gray-400 text-xs font-mono overflow-auto max-h-40 bg-gray-900 p-2 rounded">
                        {ocrResult}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default OcrUploader;
