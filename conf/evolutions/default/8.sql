# --- !Ups

# An object comment with no event_id will show on ALL events
alter table objects_comments modify event_id int null;
alter table objects_comments drop foreign key objects_comments_events_event_id_fk;
update objects_comments set event_id = 3 where event_id = 1; # Update to use events API


# Remove events constraint from object logs
alter table object_logs
    drop foreign key object_logs_events_event_id_fk;

update object_logs set event_id = 3 where event_id = 1;


# Remove events constraint from external loans
alter table external_loans
    drop foreign key external_loans_events_event_id_fk;

update external_loans set event_id = 3 where event_id = 1;

# drop events table
drop table events;
