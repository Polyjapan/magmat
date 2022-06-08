# --- !Ups

alter table object_logs modify event_id int null;

create table objects_event_data
(
    object_id int not null,
    event_id int not null,
    storage_id int null,
    deposit_place varchar(250) default null null,
    planned_use varchar(250) default null null,
    reserved_for int default null null,

    constraint objects_storage_pk
        unique (object_id, event_id),
    constraint objects_storage_objects_object_id_fk
        foreign key (object_id) references objects (object_id)
            on delete cascade ,
    constraint objects_storage_storage_storage_id_event_fk
        foreign key (storage_id) references storage (storage_id)
            on delete set null
);

insert into objects_event_data(object_id, event_id, storage_id, deposit_place, planned_use, reserved_for)
    select object_id, 3, inconv_storage_location, deposit_place, planned_use, reserved_for from objects
    where (inconv_storage_location is not null or deposit_place is not null or planned_use is not null or reserved_for is not null);

alter table objects
    drop foreign key objects_storage_storage_id_fk_2;


drop index objects_storage_storage_id_fk_2 on objects;

alter table objects
    drop deposit_place,
    drop planned_use,
    drop reserved_for,
drop inconv_storage_location;
