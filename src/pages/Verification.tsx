import { VerificationQueue } from '@/components/VerificationQueue';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Verification = () => {
  const { data: roleData, isLoading } = useRoleCheck();

  const hasVerifierRole = roleData?.roles?.some(
    role => role === 'verifier' || role === 'admin' || role === 'moderator'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Shield className="w-12 h-12 animate-pulse text-primary" />
      </div>
    );
  }

  if (!hasVerifierRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-24">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Verifier Access Required</h2>
              <p className="text-muted-foreground mb-6">
                You need verifier role to access the verification queue. Contact an administrator
                to request access.
              </p>
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <VerificationQueue />
      </div>
    </div>
  );
};

export default Verification;
