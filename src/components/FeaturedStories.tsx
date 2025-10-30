import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, Award, Clock } from 'lucide-react';

const featuredCategories = [
  {
    id: 'trending',
    title: 'Trending Now',
    icon: TrendingUp,
    color: 'bg-orange-500/10 text-orange-500',
    count: 24,
  },
  {
    id: 'featured',
    title: 'Editor\'s Pick',
    icon: Award,
    color: 'bg-purple-500/10 text-purple-500',
    count: 12,
  },
  {
    id: 'hot',
    title: 'Most Active',
    icon: Flame,
    color: 'bg-red-500/10 text-red-500',
    count: 36,
  },
  {
    id: 'recent',
    title: 'Just Posted',
    icon: Clock,
    color: 'bg-blue-500/10 text-blue-500',
    count: 8,
  },
];

export const FeaturedStories = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {featuredCategories.map((category) => {
        const Icon = category.icon;
        return (
          <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${category.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <Badge variant="secondary">{category.count}</Badge>
            </div>
            <h3 className="font-semibold text-foreground mb-2">{category.title}</h3>
            <Button variant="link" className="p-0 h-auto">
              View All →
            </Button>
          </Card>
        );
      })}
    </div>
  );
};
