"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    Snowflake,
    CheckCircle2,
    Filter,
    UserPlus,
    X,
    Loader2,
    RefreshCw,
    Mail,
    Shield,
    Calendar,
    User as UserIcon,
    History,
    ShoppingBag,
    Users,
    Activity
} from 'lucide-react';
import { getUsersAction, toggleUserStatusAction, deleteUserAction, getRolesAction, updateUserAction } from '@/users/api/controller';
import { UserWithRole } from '@/users/types';
import { type Role } from "@gonza/shared/prisma/db";

export default function UsersPage() {
    const [users, setUsers] = useState<UserWithRole[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // UI States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                getUsersAction(),
                getRolesAction()
            ]);

            if (usersRes.success) setUsers(usersRes.data as UserWithRole[]);
            if (rolesRes.success) setRoles(rolesRes.data as Role[]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && user.isActive) ||
                (statusFilter === 'frozen' && !user.isActive);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // Handle Actions
    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        setActionLoading(userId);
        try {
            const res = await toggleUserStatusAction(userId, !currentStatus);
            if (res.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
            }
        } catch (error) {
            console.error('Failed to toggle status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setActionLoading(selectedUser.id);
        try {
            const res = await deleteUserAction(selectedUser.id);
            if (res.success) {
                setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedUser) return;

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            roleId: formData.get('roleId') as string,
        };

        setActionLoading(selectedUser.id);
        try {
            const res = await updateUserAction(selectedUser.id, data);
            if (res.success) {
                setUsers(prev => prev.map(u => u.id === selectedUser.id ? (res.data as UserWithRole) : u));
                setIsEditModalOpen(false);
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Loading system users...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View, edit, and manage system users and their permissions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                        title="Refresh list"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <UserPlus className="w-4 h-4" />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/20 border border-border rounded-2xl">
                <div className="relative col-span-1 md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>
                <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="frozen">Frozen</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">User</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/10 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    (user.name?.[0] || user.email[0]).toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-foreground truncate">{user.name || 'No Name'}</span>
                                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-muted text-[11px] font-bold uppercase tracking-tight text-foreground">
                                            {user.role.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isActive ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Frozen
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsDetailsModalOpen(true);
                                                }}
                                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                className={`p-2 rounded-lg transition-colors ${user.isActive
                                                    ? 'hover:bg-blue-500/10 hover:text-blue-500'
                                                    : 'hover:bg-green-500/10 hover:text-green-500'
                                                    }`}
                                                title={user.isActive ? "Freeze User" : "Unfreeze User"}
                                                disabled={actionLoading === user.id}
                                            >
                                                {actionLoading === user.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    user.isActive ? <Snowflake className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground mb-2">
                                                <Search className="w-6 h-6" />
                                            </div>
                                            <p className="font-bold text-foreground">No users found</p>
                                            <p className="text-sm text-muted-foreground max-w-[200px]">
                                                We couldn't find any users matching your current filters.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setRoleFilter('all');
                                                    setStatusFilter('all');
                                                }}
                                                className="mt-2 text-sm font-bold text-primary hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-background border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Edit User</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 -mr-2 hover:bg-muted rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="px-8 pb-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    defaultValue={selectedUser.name || ''}
                                    className="w-full h-11 px-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={selectedUser.email}
                                    className="w-full h-11 px-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">System Role</label>
                                <select
                                    name="roleId"
                                    defaultValue={selectedUser.roleId}
                                    className="w-full h-11 px-4 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                                >
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm border border-border hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] h-11 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center"
                                    disabled={actionLoading === selectedUser.id}
                                >
                                    {actionLoading === selectedUser.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-background border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-2">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">Delete User?</h2>
                                <p className="text-sm text-muted-foreground">
                                    Are you sure you want to delete <span className="font-bold text-foreground">{selectedUser.name || selectedUser.email}</span>?
                                    This action cannot be undone and will remove all associated data.
                                </p>
                            </div>
                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 h-11 rounded-xl font-bold text-sm border border-border hover:bg-muted transition-colors"
                                >
                                    Keep User
                                </button>
                                <button
                                    onClick={handleDeleteUser}
                                    className="flex-1 h-11 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center"
                                    disabled={actionLoading === selectedUser.id}
                                >
                                    {actionLoading === selectedUser.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Details Modal */}
            {isDetailsModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-background border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header/Profile Header */}
                        <div className="relative h-32 bg-primary/10">
                            <div className="absolute -bottom-12 left-8 border-4 border-background rounded-2xl bg-background overflow-hidden">
                                <div className="w-24 h-24 bg-primary/20 flex items-center justify-center font-bold text-primary text-3xl">
                                    {selectedUser.image ? (
                                        <img src={selectedUser.image} alt={selectedUser.name || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        (selectedUser.name?.[0] || selectedUser.email[0]).toUpperCase()
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-background/50 hover:bg-background rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="pt-16 px-8 pb-8 space-y-8">
                            {/* Basic Info */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold">{selectedUser.name || 'No Name'}</h2>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {selectedUser.email}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-muted text-xs font-bold uppercase tracking-wider">
                                        {selectedUser.role.name}
                                    </span>
                                    {selectedUser.isActive ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Active Account
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold uppercase">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            Frozen Account
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl border border-border bg-muted/5 space-y-2">
                                    <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-500">
                                        <ShoppingBag className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xl font-bold">{selectedUser._count?.sales || 0}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Sales</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-border bg-muted/5 space-y-2">
                                    <div className="p-2 w-fit rounded-lg bg-orange-500/10 text-orange-500">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xl font-bold">{selectedUser._count?.products || 0}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Products</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-border bg-muted/5 space-y-2">
                                    <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-500">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xl font-bold">{selectedUser._count?.customers || 0}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customers</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-border bg-muted/5 space-y-2">
                                    <div className="p-2 w-fit rounded-lg bg-green-500/10 text-green-500">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xl font-bold">{selectedUser._count?.transactions || 0}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transfers</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm pt-4 border-t border-border">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Created On</p>
                                            <p className="font-semibold">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Access Level</p>
                                            <p className="font-semibold">{selectedUser.role.description || 'System Access'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">User ID</p>
                                            <p className="font-mono text-[11px] truncate">{selectedUser.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <History className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Update</p>
                                            <p className="font-semibold">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setIsDetailsModalOpen(false);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="flex-1 h-11 border border-border hover:bg-muted rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit Settings
                                </button>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="flex-1 h-11 bg-muted hover:bg-muted/80 rounded-xl font-bold text-sm transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

