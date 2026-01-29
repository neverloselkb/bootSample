import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../styles/editor.css';
import api from '../api/axios';

/**
 * 게시글 작성 및 수정 페이지입니다.
 */
export default function BoardFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const quillRef = useRef<ReactQuill>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [attachments, setAttachments] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<any[]>([]); // 기존 파일 목록 추가
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (id) {
            const fetchBoard = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/boards/${id}`);
                    setFormData({
                        title: response.data.title,
                        content: response.data.content
                    });
                    setExistingFiles(response.data.fileList || []); // 기존 파일 목록 저장
                } catch (err: any) {
                    const message = err.response?.data?.message || '게시글 로드에 실패했습니다.';
                    alert(message);
                    console.error('게시글 로드 실패', err);
                    navigate('/');
                } finally {
                    setLoading(false);
                }
            };
            fetchBoard();
        }
    }, [id, navigate]);

    // 에디터 이미지 업로드 핸들러
    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                const formData = new FormData();
                formData.append('image', file);

                try {
                    const res = await api.post('/files/upload/image', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    const url = res.data.url;

                    // 에디터의 현재 커서 위치에 이미지 삽입 (Ref 사용)
                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        const range = quill.getSelection();
                        if (range) {
                            quill.insertEmbed(range.index, 'image', url);
                            quill.setSelection(range.index + 1 as any);
                        } else {
                            quill.insertEmbed(quill.getLength(), 'image', url);
                        }
                    }
                } catch (error) {
                    console.error('이미지 업로드 실패', error);
                    alert('이미지 업로드에 실패했습니다.');
                }
            }
        };
    }, []);

    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
    }), [imageHandler]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const data = new FormData();
        // JSON 데이터를 Blob으로 추가하여 백엔드의 @RequestPart("board")와 매핑
        data.append('board', new Blob([JSON.stringify(formData)], { type: 'application/json' }));

        // 첨부파일 목록 추가
        attachments.forEach(file => {
            data.append('files', file);
        });

        try {
            setLoading(true);
            if (isEdit) {
                await api.put(`/boards/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('수정되었습니다.');
            } else {
                await api.post('/boards', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('등록되었습니다.');
            }
            navigate(isEdit ? `/board/${id}` : '/');
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
            }
            const message = data?.message || '저장에 실패했습니다.';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // 기존 서버 파일 삭제 핸들러
    const handleRemoveExistingFile = async (fileId: number) => {
        if (!window.confirm('파일을 서버에서 영구적으로 삭제하시겠습니까?')) return;

        try {
            await api.delete(`/boards/files/${fileId}`);
            setExistingFiles(prev => prev.filter(f => f.fileId !== fileId));
            alert('파일이 삭제되었습니다.');
        } catch (err: any) {
            const message = err.response?.data?.message || '파일 삭제에 실패했습니다.';
            alert(message);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">{isEdit ? '게시글 수정' : '새 글 작성'}</h2>

            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl space-y-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">제목</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full bg-gray-900 border ${fieldErrors.title ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                        placeholder="제목을 입력하세요"
                        required
                    />
                    {fieldErrors.title && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">내용</label>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        modules={quillModules}
                        placeholder="내용을 입력하세요"
                        className={`${fieldErrors.content ? 'border-red-500' : ''}`}
                    />
                    {fieldErrors.content && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.content}</p>
                    )}
                </div>

                {/* 파일 첨부 영역 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">파일 첨부</label>
                    <div className="space-y-4">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-all cursor-pointer"
                        />
                        {/* 기존 첨부파일 목록 (수정 모드) */}
                        {existingFiles.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">기존 첨부파일</p>
                                <ul className="space-y-2">
                                    {existingFiles.map((file) => (
                                        <li key={file.fileId} className="flex items-center justify-between bg-gray-900/40 px-4 py-2 rounded-lg border border-gray-700/50">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="text-blue-500 text-xs">✔</span>
                                                <span className="text-sm text-gray-400 truncate">{file.originName}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingFile(file.fileId)}
                                                className="text-red-500 hover:text-red-400 text-xs font-bold px-2 py-1 transition-colors"
                                            >
                                                영구 삭제
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 새로 추가할 첨부파일 목록 */}
                        {attachments.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">새로 추가된 파일</p>
                                <ul className="space-y-2">
                                    {attachments.map((file, idx) => (
                                        <li key={idx} className="flex items-center justify-between bg-blue-600/5 px-4 py-2 rounded-lg border border-blue-600/20">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="text-blue-400 text-xs">📎</span>
                                                <span className="text-sm text-gray-300 truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(idx)}
                                                className="text-gray-400 hover:text-red-400 text-xs font-bold px-2 py-1 transition-colors"
                                            >
                                                취소
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        {isEdit ? '수정 완료' : '등록하기'}
                    </button>
                    <Link
                        to={isEdit ? `/board/${id}` : '/'}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors text-center"
                    >
                        취소
                    </Link>
                </div>
            </form>
        </div>
    );
}
