import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserRole } from '@/types';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const login = useStore((s) => s.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) login(name.trim(), role);
  };

  const quickLogins: { name: string; role: UserRole }[] = [
    { name: 'Admin User', role: 'admin' },
    { name: 'Store Manager', role: 'manager' },
    { name: 'Sales Staff', role: 'salesman' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg animate-fade-in-scale">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <CardTitle className="text-lg">BikeHub POS</CardTitle>
          <p className="text-xs text-muted-foreground">Sign in to your showroom</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="salesman">Salesman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={!name.trim()}>Sign In</Button>
          </form>
          <div className="mt-4 pt-4 border-t">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Quick Login</p>
            <div className="space-y-1.5">
              {quickLogins.map((q) => (
                <button
                  key={q.role}
                  onClick={() => login(q.name, q.role)}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors active:scale-[0.98]"
                >
                  <span className="font-medium">{q.name}</span>
                  <span className="text-muted-foreground ml-2 capitalize text-xs">({q.role})</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
