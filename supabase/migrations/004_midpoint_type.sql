alter table rooms
  add column midpoint_type text check (midpoint_type in ('subway', 'bus'));
