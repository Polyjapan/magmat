# --- !Ups

create table storage
(
    storage_id int auto_increment
        primary key,
    parent_storage_id int null,
    storage_name varchar(100) null,
    event int null,
    constraint storage_storage_storage_id_fk
        foreign key (parent_storage_id) references storage (storage_id)
);


update storage_location set room = trim(room), space = trim(space), location = trim(location) where 1;

insert into storage (storage_name, event) select distinct room, if(in_conv, 3, null) from storage_location;

insert into storage (parent_storage_id, storage_name, event)
select distinct storage_id, space, if(in_conv, 3, null) from storage_location, storage
where storage.storage_name = storage_location.room AND storage_location.space is not null;

insert into storage (parent_storage_id, storage_name, event)
select distinct s2.storage_id, location, if(in_conv, 3, null) from storage_location, storage s1, storage s2
where s1.storage_name = storage_location.room
  AND s2.storage_name = storage_location.space
  AND storage_location.location is not null;

# Equivalence between two models
(select storage_location_id, storage_id, storage_name from storage
                                                               join storage_location on storage_name = room where space is null and location is null)
union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                         join storage par on par.storage_id = s.parent_storage_id
                                                                         join storage_location on s.storage_name = space and par.storage_name = room where location is null)
union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                         join storage par on par.storage_id = s.parent_storage_id
                                                                         join storage parpar on parpar.storage_id = par.parent_storage_id
                                                                         join storage_location on s.storage_name = location and par.storage_name = space and parpar.storage_name = room);

# update objects
alter table object_types
    drop foreign key object_types_storage_location_storage_location_id_fk;
alter table object_types
    drop foreign key object_types_storage_location_storage_location_id_fk_2;
alter table objects
    drop foreign key objects_storage_location_storage_location_id_fk;
alter table objects
    drop foreign key objects_storage_location_storage_location_id_fk_2;
drop index object_types_storage_location_storage_location_id_fk_2 on object_types;
drop index object_types_storage_location_storage_location_id_fk on object_types;
drop index objects_storage_location_storage_location_id_fk on objects;
drop index objects_storage_location_storage_location_id_fk_2 on objects;


update object_types
    join ((select storage_location_id, storage_id, storage_name from storage
                                                                         join storage_location on storage_name = room where space is null and location is null)
          union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                                   join storage par on par.storage_id = s.parent_storage_id
                                                                                   join storage_location on s.storage_name = space and par.storage_name = room where location is null)
          union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                                   join storage par on par.storage_id = s.parent_storage_id
                                                                                   join storage parpar on parpar.storage_id = par.parent_storage_id
                                                                                   join storage_location on s.storage_name = location and par.storage_name = space and parpar.storage_name = room)) AS mapping
    on mapping.storage_location_id = object_types.inconv_storage_location
    set object_types.inconv_storage_location = mapping.storage_id
    where object_types.inconv_storage_location is not null;

update object_types
    join ((select storage_location_id, storage_id, storage_name from storage
                                                                         join storage_location on storage_name = room where space is null and location is null)
          union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                                   join storage par on par.storage_id = s.parent_storage_id
                                                                                   join storage_location on s.storage_name = space and par.storage_name = room where location is null)
          union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                                   join storage par on par.storage_id = s.parent_storage_id
                                                                                   join storage parpar on parpar.storage_id = par.parent_storage_id
                                                                                   join storage_location on s.storage_name = location and par.storage_name = space and parpar.storage_name = room)) AS mapping
    on mapping.storage_location_id = object_types.storage_location
    set object_types.storage_location = mapping.storage_id
    where object_types.storage_location is not null;


update objects
    join ((select storage_location_id, storage_id, storage_name from storage
                                                                         join storage_location on storage_name = room where space is null and location is null)
          union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                                   join storage par on par.storage_id = s.parent_storage_id
                                                                                   join storage_location on s.storage_name = space and par.storage_name = room where location is null)
          union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                                   join storage par on par.storage_id = s.parent_storage_id
                                                                                   join storage parpar on parpar.storage_id = par.parent_storage_id
                                                                                   join storage_location on s.storage_name = location and par.storage_name = space and parpar.storage_name = room)) AS mapping
    on mapping.storage_location_id = inconv_storage_location
set inconv_storage_location = mapping.storage_id
where inconv_storage_location is not null;

update objects
    join ((select storage_location_id, storage_id, storage_name from storage
                                                                         join storage_location on storage_name = room where space is null and location is null)
          union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                                   join storage par on par.storage_id = s.parent_storage_id
                                                                                   join storage_location on s.storage_name = space and par.storage_name = room where location is null)
          union (select storage_location_id, s.storage_id, s.storage_name from storage s
                                                                                   join storage par on par.storage_id = s.parent_storage_id
                                                                                   join storage parpar on parpar.storage_id = par.parent_storage_id
                                                                                   join storage_location on s.storage_name = location and par.storage_name = space and parpar.storage_name = room)) AS mapping
    on mapping.storage_location_id = storage_location
set storage_location = mapping.storage_id
where storage_location is not null;


