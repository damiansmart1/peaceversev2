import { ReportSubmissionForm } from '@/components/ReportSubmissionForm';
import { useCitizenReports } from '@/hooks/useCitizenReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Shield, AlertTriangle, Users, CheckCircle2 } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Reports = () => {
  const { reports, isLoading } = useCitizenReports();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Comprehensive Incident Reporting</h1>
          <p className="text-lg text-muted-foreground">
            Submit detailed reports with extensive information for accurate verification and classification
          </p>
        </div>

        <ReportSubmissionForm />

        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Recent Community Reports</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : !reports || reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No reports yet. Be the first to submit a comprehensive report!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.slice(0, 10).map((report: any) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline">{report.category}</Badge>
                          {report.severity_level && (
                            <Badge variant={['critical', 'emergency'].includes(report.severity_level) ? 'destructive' : 'secondary'}>
                              {report.severity_level}
                            </Badge>
                          )}
                          {report.verification_status === 'verified' && (
                            <Badge variant="default">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {report.ai_threat_level && (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {report.ai_threat_level}
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
                      {(report.location_city || report.location_region) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {[report.location_city, report.location_region].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {report.estimated_people_affected && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          ~{report.estimated_people_affected} affected
                        </div>
                      )}
                      {report.credibility_score && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          {(report.credibility_score * 100).toFixed(0)}% credible
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