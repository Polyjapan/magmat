-- !Ups

alter table object_logs add signature TEXT null default null;

-- !Downs

alter table object_logs drop signature;
