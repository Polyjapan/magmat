-- !Ups

alter table objects modify status enum('IN_STOCK', 'OUT', 'LOST', 'RESTING', 'DELETED') default 'IN_STOCK' not null;

alter table object_logs modify source_state enum('IN_STOCK', 'OUT', 'LOST', 'RESTING', 'DELETED') not null;

alter table object_logs modify target_state enum('IN_STOCK', 'OUT', 'LOST', 'RESTING', 'DELETED') not null;

-- !Downs

alter table objects modify status enum('IN_STOCK', 'OUT', 'LOST', 'RESTING') default 'IN_STOCK' not null;

alter table object_logs modify source_state enum('IN_STOCK', 'OUT', 'LOST', 'RESTING') not null;

alter table object_logs modify target_state enum('IN_STOCK', 'OUT', 'LOST', 'RESTING') not null;

