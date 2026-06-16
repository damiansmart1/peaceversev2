
CREATE POLICY "Recipients can acknowledge alert logs"
ON public.alert_logs
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'government'::app_role)
  OR (auth.uid() = ANY (recipients))
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'government'::app_role)
  OR (auth.uid() = ANY (recipients))
);
