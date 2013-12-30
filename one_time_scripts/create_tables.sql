CREATE TABLE incident (
    id int primary key,
    date timestamp,
    location varchar,
    type varchar,
    recorded varchar,
    call_taker varchar,
    disposition varchar,
    officer varchar,
    notes text,
    lat decimal,
    lng decimal
);