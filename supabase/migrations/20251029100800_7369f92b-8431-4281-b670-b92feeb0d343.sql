-- Add vote_abstain_count column to proposals table
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS vote_abstain_count integer DEFAULT 0;

-- Create function to update proposal vote counts
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment appropriate counter
    IF NEW.vote_value = 1 THEN
      UPDATE proposals SET vote_support_count = vote_support_count + 1 WHERE id = NEW.proposal_id;
    ELSIF NEW.vote_value = -1 THEN
      UPDATE proposals SET vote_oppose_count = vote_oppose_count + 1 WHERE id = NEW.proposal_id;
    ELSIF NEW.vote_value = 0 THEN
      UPDATE proposals SET vote_abstain_count = vote_abstain_count + 1 WHERE id = NEW.proposal_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrement old counter and increment new counter
    IF OLD.vote_value = 1 THEN
      UPDATE proposals SET vote_support_count = vote_support_count - 1 WHERE id = OLD.proposal_id;
    ELSIF OLD.vote_value = -1 THEN
      UPDATE proposals SET vote_oppose_count = vote_oppose_count - 1 WHERE id = OLD.proposal_id;
    ELSIF OLD.vote_value = 0 THEN
      UPDATE proposals SET vote_abstain_count = vote_abstain_count - 1 WHERE id = OLD.proposal_id;
    END IF;
    
    IF NEW.vote_value = 1 THEN
      UPDATE proposals SET vote_support_count = vote_support_count + 1 WHERE id = NEW.proposal_id;
    ELSIF NEW.vote_value = -1 THEN
      UPDATE proposals SET vote_oppose_count = vote_oppose_count + 1 WHERE id = NEW.proposal_id;
    ELSIF NEW.vote_value = 0 THEN
      UPDATE proposals SET vote_abstain_count = vote_abstain_count + 1 WHERE id = NEW.proposal_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement counter
    IF OLD.vote_value = 1 THEN
      UPDATE proposals SET vote_support_count = vote_support_count - 1 WHERE id = OLD.proposal_id;
    ELSIF OLD.vote_value = -1 THEN
      UPDATE proposals SET vote_oppose_count = vote_oppose_count - 1 WHERE id = OLD.proposal_id;
    ELSIF OLD.vote_value = 0 THEN
      UPDATE proposals SET vote_abstain_count = vote_abstain_count - 1 WHERE id = OLD.proposal_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_vote_counts_trigger ON proposal_votes;

-- Create trigger for vote count updates
CREATE TRIGGER update_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON proposal_votes
FOR EACH ROW
EXECUTE FUNCTION update_proposal_vote_counts();