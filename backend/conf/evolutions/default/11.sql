# --- !Ups

alter table external_loans add loan_title mediumtext null;

update external_loans set loan_title = (select CONCAT('Untitled - ', name) from guests where guests.guest_id = external_loans.guest_id) where true;
update external_loans set loan_title = 'Untitled' where loan_title is null;

alter table external_loans modify loan_title mediumtext not null;

