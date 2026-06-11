CREATE OR REPLACE FUNCTION get_avg_resolution_time_hrs()
RETURNS numeric AS $$
DECLARE
  avg_hours numeric;
BEGIN
  WITH closing_events AS (
    SELECT 
      inquiry_id, 
      MAX(created_at) as closed_at
    FROM inquiry_events
    WHERE event_type = 'status_changed' 
      AND payload->>'new_status' = 'closed'
    GROUP BY inquiry_id
  )
  SELECT 
    ROUND(AVG(EXTRACT(EPOCH FROM (ce.closed_at - i.created_at)) / 3600)::numeric, 1)
  INTO avg_hours
  FROM inquiries i
  JOIN closing_events ce ON i.id = ce.inquiry_id
  WHERE i.status = 'closed';
  
  RETURN COALESCE(avg_hours, 0.0);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;
