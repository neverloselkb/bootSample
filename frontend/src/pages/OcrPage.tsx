import React from 'react';
import OcrUploader from '../components/ocr/OcrUploader';

const OcrPage: React.FC = () => {
    return (
        <div className="ocr-page-container">
            <h1 style={{ textAlign: 'center', margin: '40px 0 20px' }}>Diablo 4 Item OCR</h1>
            <OcrUploader />
        </div>
    );
};

export default OcrPage;
