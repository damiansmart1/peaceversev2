import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🙏', '✊', '🕊️'];

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface EmojiReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  size?: 'sm' | 'md';
  showAddButton?: boolean;
}

export const EmojiReactions = ({ 
  reactions, 
  onReact, 
  size = 'sm',
  showAddButton = true 
}: EmojiReactionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReact = (emoji: string) => {
    onReact(emoji);
    setIsOpen(false);
  };

  const buttonSize = size === 'sm' ? 'h-6 px-1.5 text-xs' : 'h-8 px-2 text-sm';
  const emojiSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <AnimatePresence>
        {reactions.filter(r => r.count > 0).map((reaction) => (
          <motion.div
            key={reaction.emoji}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReact(reaction.emoji)}
              className={cn(
                buttonSize,
                "rounded-full border transition-all",
                reaction.hasReacted 
                  ? "bg-primary/10 border-primary/30 hover:bg-primary/20" 
                  : "bg-muted/50 border-border/50 hover:bg-muted"
              )}
            >
              <span className={emojiSize}>{reaction.emoji}</span>
              <span className="ml-1 font-medium">{reaction.count}</span>
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

      {showAddButton && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                buttonSize,
                "rounded-full border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <Smile className={cn("w-3.5 h-3.5", size === 'md' && "w-4 h-4")} />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-2" 
            align="start"
            side="top"
          >
            <div className="grid grid-cols-5 gap-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-lg"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

// Quick emoji bar for inline reactions
export const QuickEmojiBar = ({ onReact }: { onReact: (emoji: string) => void }) => {
  const quickEmojis = ['👍', '❤️', '😂', '🎉', '🕊️'];
  
  return (
    <div className="flex items-center gap-0.5 bg-card border rounded-full px-1 py-0.5 shadow-lg">
      {quickEmojis.map((emoji) => (
        <motion.button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.8 }}
        >
          {emoji}
        </motion.button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end" side="top">
          <div className="grid grid-cols-5 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <motion.button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-lg"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
