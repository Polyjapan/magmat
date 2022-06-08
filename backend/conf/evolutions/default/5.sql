-- !Ups

alter table objects
    add planned_use VARCHAR(250) default NULL null after reserved_for;
alter table objects
    add deposit_place VARCHAR(250) default NULL null after planned_use;

-- !Downs

alter table objects drop column planned_use;
alter table objects drop column deposit_place;
