alter table rooms drop constraint rooms_status_check;
alter table rooms add constraint rooms_status_check check (status in ('waiting', 'calculating', 'done'));
