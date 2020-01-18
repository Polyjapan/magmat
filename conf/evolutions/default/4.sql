-- !Ups

alter table storage_location modify space varchar(100) null;

alter table storage_location modify location varchar(200) null;

-- !Downs

alter table storage_location modify space varchar(100) not null;

alter table storage_location modify location varchar(200) not null;
