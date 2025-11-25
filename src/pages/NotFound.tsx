import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, MessageCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="relative">
            <h1 className="text-9xl font-bold bg-peace-gradient bg-clip-text text-transparent">
              404
            </h1>
            <div className="absolute inset-0 blur-3xl bg-primary/20 -z-10" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground text-lg">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate("/")} className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>

          <div className="pt-6 border-t space-y-3">
            <p className="text-sm text-muted-foreground">Quick links:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button size="sm" variant="ghost" onClick={() => navigate('/community')}>
                Community Hub
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate('/proposals')}>
                Polls & Proposals
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate('/incidents')}>
                Incident Reporting
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate('/help')}>
                <MessageCircle className="w-3 h-3 mr-1" />
                Help
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
