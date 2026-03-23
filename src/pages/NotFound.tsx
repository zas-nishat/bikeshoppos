import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md animate-fade-in-scale">
        <div className="space-y-3">
          <div className="text-6xl font-bold text-primary">404</div>
          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Attempted URL: <code className="bg-muted px-2 py-1 rounded text-[11px] break-all inline-block mt-1">{location.pathname}</code>
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/', { replace: true })}
            className="gap-2"
            size="sm"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
