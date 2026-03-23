import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import type { UserRole } from '@/types';

export default function UsersPage() {
    const { currentUser, accounts, register, deleteUser, updateUser } = useStore();
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('salesman');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; role: UserRole } | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editPassword, setEditPassword] = useState('');

    // Only admin can access this page
    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Only administrators can manage users. Please contact your admin for access.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newName.trim()) {
            toast.error('Name is required');
            return;
        }

        if (!newEmail.trim()) {
            toast.error('Email is required');
            return;
        }

        if (!newPhone.trim()) {
            toast.error('Phone is required');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        const result = register(newName, newEmail, newPassword, newPhone, newRole);

        if (result.success) {
            toast.success(`User "${newName}" created successfully`);
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            setNewPhone('');
            setNewRole('salesman');
            setIsDialogOpen(false);
        } else {
            toast.error(result.error || 'Failed to create user');
        }
    };

    const handleDeleteUser = () => {
        if (userToDelete) {
            const result = deleteUser(userToDelete.id);
            if (result.success) {
                toast.success(`User "${userToDelete.name}" deleted successfully`);
                setDeleteConfirmOpen(false);
                setUserToDelete(null);
            } else {
                toast.error(result.error || 'Failed to delete user');
            }
        }
    };

    const openEditDialog = () => {
        if (currentUser) {
            const user = accounts.find(a => a.id === currentUser.id);
            if (user) {
                setEditName(user.name);
                setEditPhone(user.phone);
                setEditPassword('');
                setEditDialogOpen(true);
            }
        }
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editName.trim()) {
            toast.error('Name is required');
            return;
        }

        if (!editPhone.trim()) {
            toast.error('Phone is required');
            return;
        }

        if (editPassword && editPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (!currentUser) {
            toast.error('User not found');
            return;
        }

        const result = updateUser(currentUser.id, {
            name: editName,
            phone: editPhone,
            password: editPassword || undefined,
        });

        if (result.success) {
            toast.success('Profile updated successfully');
            setEditDialogOpen(false);
            setEditName('');
            setEditPhone('');
            setEditPassword('');
        } else {
            toast.error(result.error || 'Failed to update profile');
        }
    };

    return (
        <div>
            <PageHeader
                title="User Management"
                description="Create and manage user accounts (Admin only)"
            />

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle>Registered Users</CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                                <DialogDescription>
                                    Add a new user account to your showroom
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="newEmail" className="text-xs">Email</Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="newPhone" className="text-xs">Phone</Label>
                                    <Input
                                        id="newPhone"
                                        type="tel"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="01700000000"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="newPassword" className="text-xs">Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="role" className="text-xs">Role</Label>
                                    <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                                        <SelectTrigger id="role">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="salesman">Salesman</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="secondary" size="sm">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" size="sm">Create User</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell className="font-medium">{account.name}</TableCell>
                                        <TableCell>{account.email}</TableCell>
                                        <TableCell>{account.phone}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                                {account.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(account.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-1 justify-end">
                                                {account.id === currentUser?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={openEditDialog}
                                                        title="Edit your profile"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={account.id === currentUser?.id || account.role === 'admin'}
                                                    onClick={() => {
                                                        setUserToDelete({ id: account.id, name: account.name, role: account.role });
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                    title={account.id === currentUser?.id ? 'Cannot delete your own account' : account.role === 'admin' ? 'Cannot delete admin accounts' : 'Delete user'}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Your Profile</DialogTitle>
                        <DialogDescription>
                            Update your name, phone number, or password
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="editName" className="text-xs">Full Name</Label>
                            <Input
                                id="editName"
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="editPhone" className="text-xs">Phone</Label>
                            <Input
                                id="editPhone"
                                type="tel"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="01700000000"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="editPassword" className="text-xs">New Password (optional)</Label>
                            <Input
                                id="editPassword"
                                type="password"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                placeholder="Leave empty to keep current password"
                            />
                            {editPassword && editPassword.length < 6 && (
                                <p className="text-xs text-destructive">Password must be at least 6 characters</p>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary" size="sm">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" size="sm">Update Profile</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary" size="sm">Cancel</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteUser}
                        >
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
