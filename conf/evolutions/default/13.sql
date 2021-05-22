# --- !Ups

drop table storage_location;

alter table objects
    add requires_signature boolean default false not null;

update objects join object_types ot on objects.object_type_id = ot.object_type_id
    set objects.storage_location = ot.storage_location where objects.storage_location is null;

update objects join object_types ot on objects.object_type_id = ot.object_type_id
    set objects.inconv_storage_location = ot.inconv_storage_location where objects.inconv_storage_location is null;

update objects join object_types ot on objects.object_type_id = ot.object_type_id
    set objects.requires_signature = ot.requires_signature where 1;


alter table object_types
    drop foreign key object_types_storage_storage_id_fk,
    drop foreign key object_types_storage_storage_id_fk_2;

drop index object_types_storage_storage_id_fk on object_types;
drop index object_types_storage_storage_id_fk_2 on object_types;

alter table object_types
    drop column storage_location,
    drop column inconv_storage_location,
    drop column requires_signature,
    add parent_object_type_id int null after object_type_id,
    add constraint object_types_parents_constraint
        foreign key (parent_object_type_id) references object_types (object_type_id);

