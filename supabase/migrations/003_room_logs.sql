-- no FK to rooms; rooms has a 1-day TTL and will be deleted
create table room_logs (
  room_id               text primary key,
  created_at            timestamptz not null default now(),
  completed_at          timestamptz,
  max_participants      int not null check (max_participants >= 1),
  actual_participants   int check (actual_participants >= 0),
  midpoint_station_id   text,
  midpoint_station_name text,
  appointment_date      date,
  constraint chk_participants_count
    check (actual_participants is null or actual_participants <= max_participants),
  constraint chk_completed_after_created
    check (completed_at is null or completed_at >= created_at),
  constraint chk_midpoint_station_consistent
    check ((midpoint_station_id is null) = (midpoint_station_name is null))
);

create index on room_logs(created_at);

alter table room_logs enable row level security;
