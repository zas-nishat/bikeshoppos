import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import RegisterPage from './RegisterPage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const loginWithCredentials = useStore((s) => s.loginWithCredentials);

  if (showRegister) return <RegisterPage onBack={() => setShowRegister(false)} />;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginWithCredentials(email, password);
    if (result.success) {
      toast.success('Welcome back!');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@bikehub.com', password: 'admin123' },
    { label: 'Manager', email: 'manager@bikehub.com', password: 'manager123' },
    { label: 'Salesman', email: 'sales@bikehub.com', password: 'sales123' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg animate-fade-in-scale">
        <CardHeader className="text-center pb-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <CardTitle className="text-lg">BikeHub POS</CardTitle>
          <p className="text-xs text-muted-foreground">Sign in to your showroom</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={!email || !password}>Sign In</Button>
          </form>

          <div className="mt-3 text-center">
            <button onClick={() => setShowRegister(true)} className="text-xs text-primary hover:underline">
              Don't have an account? Create one
            </button>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Demo Accounts</p>
            <div className="space-y-1.5">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  onClick={() => {
                    const result = loginWithCredentials(a.email, a.password);
                    if (result.success) toast.success(`Logged in as ${a.label}`);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors active:scale-[0.98]"
                >
                  <span className="font-medium">{a.label}</span>
                  <span className="text-muted-foreground ml-2 text-xs">({a.email})</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
