# --- !Ups

alter table external_loans modify guest_id int null;
alter table external_loans add user_id int null after guest_id;

alter table object_logs modify user int null;
alter table object_logs add guest_id int null after user;
alter table object_logs
    add constraint object_logs_guests_guest_id_fk
        foreign key (guest_id) references guests (guest_id);

