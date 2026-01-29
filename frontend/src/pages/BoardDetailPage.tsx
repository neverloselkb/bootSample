import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/editor.css';

interface Attachment {
    fileId: number;
    originName: string;
    storedName: string;
}

interface Comment {
    commentId: number;
    content: string;
    nickname: string;
    username: string;
    createdAt: string;
}

interface BoardDetail {
    boardId: number;
    title: string;
    content: string;
    nickname: string;
    username: string;
    createdAt: string;
    modifiedAt: string;
    fileList: Attachment[];
    commentList: Comment[];
}

/**
 * 게시글 상세 페이지입니다.
 */
export default function BoardDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { username, role } = useAuth();
    const [board, setBoard] = useState<BoardDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentInput, setCommentInput] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const fetchBoard = async () => {
        try {
            const response = await api.get(`/boards/${id}`);
            setBoard(response.data);
        } catch (err) {
            console.error('게시글 로드 실패', err);
            alert('게시글을 찾을 수 없습니다.');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/boards/${id}`);
            alert('삭제되었습니다.');
            navigate('/');
        } catch (err: any) {
            const message = err.response?.data?.message || '삭제에 실패했습니다.';
            alert(message);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        setSubmittingComment(true);
        try {
            await api.post(`/comments/${id}`, { content: commentInput });
            setCommentInput('');
            fetchBoard(); // 댓글 작성 후 다시 불러오기
        } catch (err) {
            console.error('댓글 작성 실패', err);
            alert('댓글 작성에 실패했습니다.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCommentDelete = async (commentId: number) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            fetchBoard(); // 삭제 후 다시 불러오기
        } catch (err) {
            console.error('댓글 삭제 실패', err);
            alert('댓글 삭제에 실패했습니다.');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
    if (!board) return null;

    // 본인 게시글이거나 관리자인 경우 수정/삭제 버튼 노출
    const canManage = username === board.username || role === 'ROLE_ADMIN';

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <div className="mb-6 flex items-center justify-between">
                    <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                        ← 목록으로 돌아가기
                    </Link>
                    {canManage && (
                        <div className="flex gap-2">
                            <Link
                                to={`/board/edit/${id}`}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors border border-gray-600"
                            >
                                수정
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-sm border border-red-600/50 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    )}
                </div>

                <article className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
                    <header className="border-b border-gray-700 pb-6 mb-8">
                        <h1 className="text-3xl font-bold mb-4">{board.title}</h1>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <span className="font-medium text-blue-400 flex items-center gap-1">
                                <span className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-[10px] text-blue-400">
                                    👤
                                </span>
                                {board.nickname}
                            </span>
                            <span>•</span>
                            <span>{new Date(board.createdAt).toLocaleString()}</span>
                        </div>
                    </header>

                    <div
                        className="board-content-view ql-editor max-w-none min-h-[300px] text-gray-300 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(board.content) }}
                    />

                    {/* 첨부파일 목록 */}
                    {board.fileList && board.fileList.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-700">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span>📎</span> 첨부파일 ({board.fileList.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {board.fileList.map((file) => (
                                    <a
                                        key={file.fileId}
                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/files/download/${file.storedName}?originName=${encodeURIComponent(file.originName)}`}
                                        className="flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-700/50 rounded-xl border border-gray-700 transition-all group"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="text-sm text-gray-300 group-hover:text-blue-400 truncate pr-4">
                                            {file.originName}
                                        </span>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">다운로드</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </div>

            {/* 댓글 엔티티 관리 섹션 */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    💬 댓글 ({board.commentList?.length || 0})
                </h3>

                {/* 댓글 작성 폼 */}
                {username ? (
                    <form onSubmit={handleCommentSubmit} className="mb-10">
                        <div className="relative">
                            <textarea
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="따뜻한 댓글 하나가 작성자에게 큰 힘이 됩니다."
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 min-h-[100px] text-gray-200 focus:outline-none focus:border-blue-500 transition-colors resize-none pr-20"
                            />
                            <button
                                type="submit"
                                disabled={submittingComment || !commentInput.trim()}
                                className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                            >
                                {submittingComment ? '작성 중...' : '등록'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-400 mb-10">
                        댓글을 작성하려면 <Link to="/login" className="text-blue-400 hover:underline">로그인</Link>이 필요합니다.
                    </div>
                )}

                {/* 댓글 목록 */}
                <div className="space-y-6">
                    {board.commentList && board.commentList.length > 0 ? (
                        board.commentList.map((comment) => (
                            <div key={comment.commentId} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex-shrink-0 flex items-center justify-center text-blue-400 font-bold border border-blue-600/20">
                                    {comment.nickname.substring(0, 1)}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-200">{comment.nickname}</span>
                                            <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                                        </div>
                                        {(username === comment.username || role === 'ROLE_ADMIN') && (
                                            <button
                                                onClick={() => handleCommentDelete(comment.commentId)}
                                                className="text-xs text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded hover:bg-red-400/10"
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            아직 댓글이 없습니다. 첫 댓글의 주인공이 되어보세요!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
