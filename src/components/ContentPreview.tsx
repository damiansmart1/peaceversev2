import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SafeHTML from '@/components/SafeHTML';
import { Eye } from 'lucide-react';

interface ContentPreviewProps {
  title?: string;
  summary?: string;
  body?: string;
  tags?: string[];
  additionalInfo?: React.ReactNode;
}

export default function ContentPreview({ 
  title, 
  summary, 
  body, 
  tags = [],
  additionalInfo
}: ContentPreviewProps) {
  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {additionalInfo && (
          <div className="pb-4 border-b border-border">
            {additionalInfo}
          </div>
        )}
        
        {title && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {title}
            </h2>
          </div>
        )}

        {summary && (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm font-medium mb-1 text-muted-foreground">Summary</p>
            <SafeHTML 
              html={summary}
              className="text-foreground"
            />
          </div>
        )}

        {body && (
          <div>
            <SafeHTML 
              html={body}
              className="prose-content"
            />
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">Tags:</span>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {!title && !summary && !body && tags.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Start filling out the form to see a preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
