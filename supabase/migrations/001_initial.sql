create table rooms (
  id text primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '3 days'),
  max_participants int not null check (max_participants between 1 and 10),
  appointment_date date,
  status text not null default 'waiting' check (status in ('waiting', 'done')),
  midpoint_station_id text,
  midpoint_station_name text,
  midpoint_lat double precision,
  midpoint_lng double precision
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(id) on delete cascade,
  nickname text not null,
  address_name text not null,
  lat double precision not null,
  lng double precision not null,
  joined_at timestamptz not null default now()
);

create index on participants(room_id);

alter table participants enable row level security;
alter table rooms enable row level security;

create policy "rooms: 누구나 읽기" on rooms for select using (true);
create policy "rooms: 누구나 생성" on rooms for insert with check (true);
create policy "rooms: 누구나 업데이트" on rooms for update using (true);

create policy "participants: 누구나 읽기" on participants for select using (true);
create policy "participants: 누구나 생성" on participants for insert with check (true);
