-- !Ups

alter table object_types add deleted BOOLEAN default false not null;

-- !Downs

alter table object_types drop deleted;

