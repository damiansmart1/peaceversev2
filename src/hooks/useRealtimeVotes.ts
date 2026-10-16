import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
interface VoteCounts { supportCount:number; opposeCount:number; abstainCount:number }
export const useRealtimeVotes = (proposalId:string, initialCounts:VoteCounts) => {
 const qc=useQueryClient();
 const [counts,setCounts]=useState(initialCounts);
 useEffect(()=>{setCounts(initialCounts);},[initialCounts.supportCount,initialCounts.opposeCount,initialCounts.abstainCount]);
 useEffect(()=>{
  if(!proposalId)return;
  const channel=supabase.channel(`proposal-totals-${proposalId}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'proposals',filter:`id=eq.${proposalId}`},(payload)=>{
   const p=payload.new;
   setCounts({supportCount:p.votes_for || 0,opposeCount:p.votes_against || 0,abstainCount:p.votes_abstain || 0});
   qc.invalidateQueries({queryKey:['proposals']}); qc.invalidateQueries({queryKey:['proposal',proposalId]});
  }).subscribe();
  return ()=>{supabase.removeChannel(channel);};
 },[proposalId,qc]);
 return counts;
};
