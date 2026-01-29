import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Board {
    boardId: number;
    title: string;
    nickname: string;
    createdAt: string;
}

/**
 * 게시글 목록 페이지입니다.
 */
export default function BoardListPage() {
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const fetchBoards = async (pageNumber: number, searchKeyword: string) => {
        setLoading(true);
        try {
            const response = await api.get('/boards', {
                params: {
                    page: pageNumber,
                    size: 10,
                    keyword: searchKeyword || null
                }
            });
            setBoards(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error('게시글 로드 실패', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards(page, keyword);
    }, [page, keyword]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setKeyword(searchInput);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold">커뮤니티 게시판</h2>
                    <p className="text-gray-400 mt-1">자유롭게 의견을 나누는 공간입니다.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="검색어 입력..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button type="submit" className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-400">
                            🔍
                        </button>
                    </form>
                    <Link
                        to="/board/new"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-blue-600/20"
                    >
                        글쓰기
                    </Link>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px] sm:min-w-0">
                        <thead className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-20">No</th>
                                <th className="px-6 py-4 font-semibold">제목</th>
                                <th className="px-6 py-4 font-semibold w-40">작성자</th>
                                <th className="px-6 py-4 font-semibold text-right w-32">작성일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500">로딩 중...</td>
                                </tr>
                            ) : boards.length > 0 ? boards.map((board) => (
                                <tr key={board.boardId} className="hover:bg-gray-700/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 text-gray-500 text-sm">{board.boardId}</td>
                                    <td className="px-6 py-4">
                                        <Link to={`/board/${board.boardId}`} className="text-white group-hover:text-blue-400 transition-colors font-medium">
                                            {board.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        <span className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-[10px] font-bold">
                                                {board.nickname.substring(0, 1)}
                                            </div>
                                            <span className="text-sm">{board.nickname}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs text-right">
                                        {new Date(board.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500">게시글이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 페이지네이션 */}
            {!loading && totalPages > 0 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="px-4 py-2 rounded-lg border border-gray-700 text-sm font-medium disabled:opacity-30 hover:bg-gray-800 transition-colors"
                    >
                        이전
                    </button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i)}
                                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${page === i
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-700 text-gray-400 hover:bg-gray-800'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        )).filter((_, i) => i >= Math.floor(page / 5) * 5 && i < Math.floor(page / 5) * 5 + 5)}
                    </div>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages - 1}
                        className="px-4 py-2 rounded-lg border border-gray-700 text-sm font-medium disabled:opacity-30 hover:bg-gray-800 transition-colors"
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}
