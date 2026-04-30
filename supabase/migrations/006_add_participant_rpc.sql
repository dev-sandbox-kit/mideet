create or replace function add_participant_if_not_full(
  p_room_id text,
  p_nickname text,
  p_address_name text,
  p_lat double precision,
  p_lng double precision
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_max int;
  v_status text;
  v_count int;
  v_id uuid;
  v_nickname text;
begin
  select max_participants, status into v_max, v_status
  from rooms where id = p_room_id for update;

  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  if v_status = 'done' then
    return jsonb_build_object('error', 'closed');
  end if;

  select count(*) into v_count from participants where room_id = p_room_id;

  if v_count >= v_max then
    return jsonb_build_object('error', 'full');
  end if;

  v_nickname := nullif(btrim(p_nickname), '');
  if v_nickname is null then
    v_nickname := '참여자 ' || (v_count + 1);
  end if;

  insert into participants (room_id, nickname, address_name, lat, lng)
  values (p_room_id, v_nickname, p_address_name, p_lat, p_lng)
  returning id into v_id;

  return jsonb_build_object('id', v_id);
end;
$$;
