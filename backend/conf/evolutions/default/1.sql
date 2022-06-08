-- !Ups

create table events
(
    event_id   int auto_increment
        primary key,
    event_name varchar(50) not null,
    in_conv boolean default false
);

create table external_lenders
(
    external_lender_id int auto_increment
        primary key,
    name               varchar(150) not null,
    description        text         null,
    phone_number       text         not null,
    email              text         not null,
    location           text         not null
);

create table external_loans
(
    external_loan_id   int                                                                               not null
        primary key auto_increment,
    external_lender_id int                                                                               not null,
    event_id           int                                                                               not null,
    pickup_time        datetime                                                                          not null,
    return_time        datetime                                                                          not null,
    loan_details       text                                                                              null,
    pickup_place       text                                                                              null,
    return_place       text                                                                              null,
    status             enum ('AWAITING_PICKUP', 'AWAITING_RETURN', 'RETURNED') default 'AWAITING_PICKUP' null,
    constraint external_loans_events_event_id_fk
        foreign key (event_id) references events (event_id)
            on update cascade on delete cascade,
    constraint external_loans_external_lenders_external_lender_id_fk
        foreign key (external_lender_id) references external_lenders (external_lender_id)
            on update cascade
);

create table storage_location
(
    storage_location_id int auto_increment
        primary key,
    in_conv             tinyint(1)   not null,
    room                varchar(70)  not null,
    space               varchar(100) not null,
    location            varchar(200) not null
);

create table object_types
(
    object_type_id          int auto_increment
        primary key,
    name                    varchar(200) not null,
    description             text         null,
    storage_location        int          null,
    inconv_storage_location int          null,
    part_of_loan            int          null,
    constraint object_types_external_loans_external_loan_id_fk
        foreign key (part_of_loan) references external_loans (external_loan_id)
            on update cascade on delete set null,
    constraint object_types_storage_location_storage_location_id_fk
        foreign key (storage_location) references storage_location (storage_location_id)
            on update cascade on delete set null,
    constraint object_types_storage_location_storage_location_id_fk_2
        foreign key (inconv_storage_location) references storage_location (storage_location_id)
            on update cascade on delete set null
);

create table objects
(
    object_id               int auto_increment
        primary key,
    object_type_id          int                                                            not null,
    suffix                  varchar(50)                                                    not null,
    description             text                                                           null,
    storage_location        int                                                            null,
    inconv_storage_location int                                                            null,
    part_of_loan            int                                                            null,
    reserved_for            int                                                            null,
    asset_tag               varchar(30)                                                    null,
    status                  enum ('IN_STOCK', 'OUT', 'LOST', 'RESTING') default 'IN_STOCK' not null,
    constraint objects_external_loans_external_loan_id_fk
        foreign key (part_of_loan) references external_loans (external_loan_id)
            on update cascade on delete cascade,
    constraint objects_object_types_object_type_id_fk
        foreign key (object_type_id) references object_types (object_type_id)
            on update cascade on delete cascade,
    constraint objects_storage_location_storage_location_id_fk
        foreign key (storage_location) references storage_location (storage_location_id)
            on update cascade on delete set null,
    constraint objects_storage_location_storage_location_id_fk_2
        foreign key (inconv_storage_location) references storage_location (storage_location_id)
            on update cascade on delete set null
);

create table object_logs
(
    object_id    int                                         not null,
    event_id     int                                         not null,
    timestamp    datetime                                    null,
    changed_by   int                                         not null,
    user         int                                         not null,
    source_state enum ('IN_STOCK', 'OUT', 'LOST', 'RESTING') not null,
    target_state enum ('IN_STOCK', 'OUT', 'LOST', 'RESTING') not null,
    constraint object_logs_events_event_id_fk
        foreign key (event_id) references events (event_id)
            on update cascade on delete cascade,
    constraint object_logs_objects_object_id_fk
        foreign key (object_id) references objects (object_id)
            on update cascade on delete cascade
);

create index object_logs_timestamp_index
    on object_logs (timestamp);

create index objects_asset_tag_index
    on objects (asset_tag);

create table objects_comments
(
    object_id int      not null,
    event_id  int      not null,
    timestamp datetime null,
    writer    int      not null,
    comment   text     not null,
    constraint objects_comments_events_event_id_fk
        foreign key (event_id) references events (event_id)
            on update cascade on delete cascade,
    constraint objects_comments_objects_object_id_fk
        foreign key (object_id) references objects (object_id)
            on update cascade on delete cascade
);

create index objects_comments_timestamp_index
    on objects_comments (timestamp);

create index storage_location_room_index
    on storage_location (room);

create index storage_location_room_space_index
    on storage_location (room, space);

create index storage_location_room_space_location_index
    on storage_location (room, space, location);

-- !Downs

drop table object_logs;

drop table objects_comments;

drop table objects;

drop table object_types;

drop table external_loans;

drop table events;

drop table external_lenders;

drop table storage_location;

