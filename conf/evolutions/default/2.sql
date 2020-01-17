-- !Ups

alter table object_types
    add requires_signature boolean not null default false;

-- !Downs

alter table object_types drop requires_signature;
