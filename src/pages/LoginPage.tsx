import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { loginWithCredentials, isInitialized } = useStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginWithCredentials(identifier, password);
    if (result.success) {
      toast.success('Welcome back!');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const account = useStore.getState().accounts.find((a) => a.email.toLowerCase() === forgotEmail.toLowerCase());
    if (account) {
      toast.success(`Password reset link sent to ${forgotEmail}`);
      setShowForgotPassword(false);
      setForgotEmail('');
    } else {
      toast.error('Email not found');
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
          <p className="text-xs text-muted-foreground">{showForgotPassword ? 'Reset your password' : 'Sign in to your showroom'}</p>
        </CardHeader>
        <CardContent>
          {/* {!isInitialized && (
             <div className="flex flex-col items-center justify-center py-4 space-y-2 text-muted-foreground animate-pulse">
               <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px]">Syncing data from database...</p>
             </div>
          )} */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgotEmail" className="text-xs">Email Address</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={!forgotEmail}>Send Reset Link</Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail('');
                }}
              >
                Back to Sign In
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="identifier" className="text-xs">Email or Username</Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com or your username"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!identifier || !password || !isInitialized}>
                  {!isInitialized ? 'Syncing...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-3 text-center">
                <button onClick={() => setShowForgotPassword(true)} className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
