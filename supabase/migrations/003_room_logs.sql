create table room_logs (
  room_id               text primary key,
  created_at            timestamptz not null default now(),
  completed_at          timestamptz,
  max_participants      int not null,
  actual_participants   int,
  midpoint_station_id   text,
  midpoint_station_name text,
  appointment_date      date
);
