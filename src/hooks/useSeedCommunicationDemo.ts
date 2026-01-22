import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSeedCommunicationDemo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mode: "reset" | "clear" = "reset") => {
      const { data, error } = await supabase.functions.invoke(
        "seed-communication-demo",
        {
          body: { mode },
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Refresh all communication module queries so the UI updates immediately.
      queryClient.invalidateQueries({ queryKey: ["communication-channels"] });
      queryClient.invalidateQueries({ queryKey: ["channel-messages"] });
      queryClient.invalidateQueries({ queryKey: ["ocha-documents"] });
      queryClient.invalidateQueries({ queryKey: ["broadcast-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["field-reports"] });
      queryClient.invalidateQueries({ queryKey: ["escalation-logs"] });
      toast.success("Demo communication data created");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to seed demo data");
    },
  });
}

