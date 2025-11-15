import { ReportSubmissionForm } from '@/components/ReportSubmissionForm';
import { useCitizenReports } from '@/hooks/useCitizenReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Shield, AlertTriangle } from 'lucide-react';

const Reports = () => {
  const { reports, isLoading } = useCitizenReports();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Citizen Reporting</h1>
          <p className="text-lg text-muted-foreground">
            Your voice matters. Share incidents, concerns, and observations to build a comprehensive peace database.
          </p>
        </div>

        {/* Submission Form */}
        <ReportSubmissionForm />

        {/* Recent Reports */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Recent Community Reports</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : !reports || reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No reports yet. Be the first to submit!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.slice(0, 10).map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{report.category}</Badge>
                          {report.verification_status && (
                            <Badge
                              variant={report.verification_status === 'verified' ? 'default' : 'secondary'}
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {report.verification_status}
                            </Badge>
                          )}
                          {report.threat_level && (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {report.threat_level}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{report.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                      {report.location_name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {report.location_name}
                        </div>
                      )}
                      {report.ai_credibility_score && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          AI Credibility: {report.ai_credibility_score}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
