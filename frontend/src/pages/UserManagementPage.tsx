import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Member {
    memberId: number;
    username: string;
    nickname: string;
    role: string;
    createdAt: string;
}

/**
 * 관리자용 사용자 관리 페이지입니다.
 */
export default function UserManagementPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await api.get('/admin/members');
                setMembers(response.data);
            } catch (err: any) {
                console.error('사용자 목록 로드 실패', err);
                setError('권한이 없거나 목록을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const handleRoleChange = async (memberId: number, newRole: string) => {
        if (!window.confirm(`권한을 ${newRole}으로 변경하시겠습니까?`)) return;
        try {
            await api.post(`/admin/members/${memberId}/role`, newRole, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert('권한이 변경되었습니다.');
            setMembers(members.map(m => m.memberId === memberId ? { ...m, role: newRole } : m));
        } catch (err) {
            alert('권한 변경에 실패했습니다.');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-8">사용자 관리 (관리자)</h2>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl text-center">
                    {error}
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px] sm:min-w-0">
                            <thead className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">No</th>
                                    <th className="px-6 py-4 font-semibold">아이디</th>
                                    <th className="px-6 py-4 font-semibold">닉네임</th>
                                    <th className="px-6 py-4 font-semibold">권한</th>
                                    <th className="px-6 py-4 font-semibold text-center">권한 변경</th>
                                    <th className="px-6 py-4 font-semibold text-right">가입일</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {members.map((member) => (
                                    <tr key={member.memberId} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 text-sm">{member.memberId}</td>
                                        <td className="px-6 py-4 font-medium text-white">{member.username}</td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <span className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                                    {member.nickname.substring(0, 1)}
                                                </div>
                                                {member.nickname}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${member.role === 'ADMIN' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                                }`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.memberId, e.target.value)}
                                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                                            >
                                                <option value="USER">USER로 변경</option>
                                                <option value="ADMIN">ADMIN으로 변경</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm text-right">
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
