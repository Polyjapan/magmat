# --- !Ups

alter table external_loans
    drop foreign key external_loans_external_lenders_external_lender_id_fk;

drop index external_loans_external_lenders_external_lender_id_fk on external_loans;

rename table external_lenders to guests;

alter table guests modify external_lender_id int not null;

alter table guests drop primary key;

alter table guests
    change external_lender_id guest_id int primary key auto_increment,
    modify phone_number text null,
    modify email text null,
    modify location text null,
    add organization varchar(200) null default null;

alter table external_loans
    change external_lender_id guest_id int not null,
    add constraint external_loans_guests_guest_id_fk
        foreign key (guest_id) references guests (guest_id)
            on update cascade;